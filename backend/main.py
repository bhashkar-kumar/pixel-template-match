"""CineMatch backend: loads the trained NeuMF model once and serves recommendations.

Run:  uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""
import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

import numpy as np
import pandas as pd
import torch
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from model import NeuMF, fit_new_user

ART = Path(__file__).parent / "artifacts"
S = {}  # app state, filled at startup


@asynccontextmanager
async def lifespan(app: FastAPI):
    mp = json.load(open(ART / "mappings.json"))
    cfg = mp["neumf_config"]
    model = NeuMF(mp["n_users"], mp["n_items"], cfg["k"], drop=cfg["drop"], global_mean=mp["global_mean"])
    model.load_state_dict(torch.load(ART / "neumf.pt", map_location="cpu"))
    model.eval()
    for p in model.parameters():
        p.requires_grad_(False)

    movies = pd.read_csv(ART / "movies.csv")
    emb = np.load(ART / "movie_embeddings.npy")
    S.update(
        model=model,
        user_to_idx={int(k): v for k, v in mp["user_to_idx"].items()},
        item_to_idx={int(k): v for k, v in mp["item_to_idx"].items()},
        idx_to_item={v: int(k) for k, v in mp["item_to_idx"].items()},
        seen={int(k): set(v) for k, v in json.load(open(ART / "seen.json")).items()},
        movies=movies.set_index("item_id"),
        emb=emb / np.linalg.norm(emb, axis=1, keepdims=True),
        metrics=json.load(open(ART / "metrics.json")),
        n_items=mp["n_items"],
    )
    yield


app = FastAPI(title="CineMatch API", lifespan=lifespan)

# Which websites may call this API. Add your deployed frontend URL via the CORS_ORIGINS env var (comma-separated).
origins = ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"]
origins += [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])


# ------------------------------------------------------------------ helpers
def movie_json(item_id: int, score: Optional[float] = None) -> dict:
    r = S["movies"].loc[item_id]
    return {
        "id": int(item_id),
        "title": r["title_clean"],
        "year": None if pd.isna(r["year"]) else int(r["year"]),
        "genres": [g for g in str(r["genres"]).split("|") if g and g != "nan"],
        "poster_url": None,   # MovieLens has no posters; add TMDB lookup later
        "overview": None,
        "score": None if score is None else round(float(score), 3),
    }


def to_match(pred_rating: float) -> float:
    """Predicted star rating (1-5) -> 0..1 fraction, which is what the frontend's MatchRing expects."""
    return float(np.clip((pred_rating - 1.0) / 4.0, 0.0, 1.0))


def top_n(pred: np.ndarray, exclude_items: set, n: int) -> List[dict]:
    out = []
    for idx in np.argsort(-pred):
        item = S["idx_to_item"][int(idx)]
        if item in exclude_items:
            continue
        out.append(movie_json(item, to_match(pred[idx])))
        if len(out) == n:
            break
    return out


# ------------------------------------------------------------------ endpoints
@app.get("/health")
def health():
    return {"status": "ok", "users": len(S["user_to_idx"]), "movies": S["n_items"]}


@app.get("/movies/popular")
def popular(n: int = Query(20, ge=1, le=100)):
    top = S["movies"].sort_values("n_ratings", ascending=False).head(n)
    return [movie_json(i) for i in top.index]


@app.get("/movies/search")
def search(q: str = Query("", max_length=100), n: int = Query(20, ge=1, le=50)):
    q = q.strip().lower()
    if not q:
        return popular(n)
    df = S["movies"]
    hit = df[df["title_clean"].str.lower().str.contains(q, regex=False, na=False)]
    return [movie_json(i) for i in hit.sort_values("n_ratings", ascending=False).head(n).index]


@app.get("/recommend/{user_id}")
def recommend_existing(user_id: int, n: int = Query(10, ge=1, le=50)):
    if user_id not in S["user_to_idx"]:
        raise HTTPException(404, f"Unknown user_id {user_id}. Valid range: 1-{len(S['user_to_idx'])}")
    u = S["user_to_idx"][user_id]
    with torch.no_grad():
        pred = S["model"](torch.full((S["n_items"],), u), torch.arange(S["n_items"])).numpy()
    return top_n(pred, S["seen"].get(user_id, set()), n)


class RatingIn(BaseModel):
    movie_id: int
    rating: float = Field(ge=1, le=5)


class NewUserIn(BaseModel):
    ratings: List[RatingIn] = Field(min_length=1)
    n: int = Field(10, ge=1, le=50)


@app.post("/recommend/new-user")
def recommend_new_user(body: NewUserIn):
    unknown = [r.movie_id for r in body.ratings if r.movie_id not in S["item_to_idx"]]
    if unknown:
        raise HTTPException(422, f"Unknown movie ids: {unknown}")
    idx = torch.tensor([S["item_to_idx"][r.movie_id] for r in body.ratings])
    y = torch.tensor([r.rating for r in body.ratings], dtype=torch.float32)
    gu, mu, bu = fit_new_user(S["model"], idx, y)
    with torch.no_grad():
        pred = S["model"].forward_vec(gu, mu, bu, torch.arange(S["n_items"])).numpy()
    return top_n(pred, {r.movie_id for r in body.ratings}, body.n)


@app.get("/movies/{movie_id}/similar")
def similar(movie_id: int, n: int = Query(10, ge=1, le=30)):
    if movie_id not in S["item_to_idx"]:
        raise HTTPException(404, f"Unknown movie_id {movie_id}")
    q = S["item_to_idx"][movie_id]
    sim = S["emb"] @ S["emb"][q]
    order = [int(i) for i in np.argsort(-sim) if int(i) != q][:n]
    return [movie_json(S["idx_to_item"][i], (sim[i] + 1) / 2) for i in order]


@app.get("/metrics")
def metrics():
    """Model comparison numbers, for the About page."""
    return S["metrics"]
