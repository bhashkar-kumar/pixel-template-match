import type { Movie, Rating } from "@/types/movie";
import { MOCK_MOVIES, POPULAR_IDS } from "@/lib/mock-data";

const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

/** True when no backend URL is configured and mock data is used. */
export const IS_MOCK = !API_URL;

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Can't reach the CineMatch server. Is it running?");
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { detail?: unknown };
      detail = typeof body.detail === "string" ? body.detail : "";
    } catch {
      /* ignore */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ---------- mock helpers ----------
function seeded(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function scoreAll(rand: () => number, exclude: Set<number>, boostGenres: Map<string, number>): Movie[] {
  return MOCK_MOVIES.filter((m) => !exclude.has(m.id))
    .map((m) => {
      const boost = m.genres.reduce((acc, g) => acc + (boostGenres.get(g) ?? 0), 0);
      const quality = ((m.avg_rating ?? 3) - 3) * 0.08;
      const score = Math.max(0.3, Math.min(0.99, 0.5 + rand() * 0.15 + quality + boost * 0.04));
      return { ...m, score: Math.round(score * 1000) / 1000 };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

// ---------- public API ----------
export async function getPopular(n = 24): Promise<Movie[]> {
  if (!IS_MOCK) return request(`/movies/popular?n=${n}`);
  await delay();
  return POPULAR_IDS.slice(0, n).map((id) => MOCK_MOVIES.find((m) => m.id === id)).filter(Boolean) as Movie[];
}

export async function searchMovies(q: string, n = 30): Promise<Movie[]> {
  if (!IS_MOCK) return request(`/movies/search?q=${encodeURIComponent(q)}&n=${n}`);
  await delay();
  const term = q.trim().toLowerCase();
  return MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(term))
    .sort((a, b) => (b.n_ratings ?? 0) - (a.n_ratings ?? 0))
    .slice(0, n);
}

export async function getRecommendationsForUser(userId: number, n = 10): Promise<Movie[]> {
  if (!IS_MOCK) return request(`/recommend/${userId}?n=${n}`);
  await delay();
  const rand = seeded(userId * 7919);
  const genres = new Map<string, number>();
  const all = Array.from(new Set(MOCK_MOVIES.flatMap((m) => m.genres)));
  for (let i = 0; i < 3; i++) genres.set(all[Math.floor(rand() * all.length)] ?? "Drama", 2);
  return scoreAll(rand, new Set(), genres).slice(0, n);
}

export async function getRecommendationsForNewUser(ratings: Rating[], n = 10): Promise<Movie[]> {
  if (!IS_MOCK) return request("/recommend/new-user", { method: "POST", body: JSON.stringify({ ratings, n }) });
  await delay();
  const genres = new Map<string, number>();
  for (const r of ratings) {
    const m = MOCK_MOVIES.find((x) => x.id === r.movie_id);
    m?.genres.forEach((g) => genres.set(g, (genres.get(g) ?? 0) + (r.rating - 3)));
  }
  const rand = seeded(ratings.reduce((a, r) => a + r.movie_id * r.rating, 1) + Date.now() % 1000);
  return scoreAll(rand, new Set(ratings.map((r) => r.movie_id)), genres).slice(0, n);
}

export async function getSimilarMovies(movieId: number, n = 10): Promise<Movie[]> {
  if (!IS_MOCK) return request(`/movies/${movieId}/similar?n=${n}`);
  await delay();
  const base = MOCK_MOVIES.find((m) => m.id === movieId);
  if (!base) return [];
  return MOCK_MOVIES.filter((m) => m.id !== movieId)
    .map((m) => {
      const shared = m.genres.filter((g) => base.genres.includes(g)).length;
      const pop = Math.min(0.1, (m.n_ratings ?? 0) / 5000);
      return { ...m, score: Math.min(0.98, 0.45 + shared * 0.13 + pop) };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, n);
}
