import type { Movie, Rating } from "@/types/movie";
import { MOCK_MOVIES, POPULAR_IDS } from "@/lib/mock-data";

const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined)?.replace(/\/$/, "") ?? "";

/** True when no backend URL is configured and mock data is used. */
export const IS_MOCK = !API_URL;

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
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
      const score = Math.min(0.99, 0.55 + rand() * 0.3 + boost * 0.05);
      return { ...m, score: Math.round(score * 1000) / 1000 };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

// ---------- public API ----------
export async function getPopular(): Promise<Movie[]> {
  if (!IS_MOCK) return request("/movies/popular");
  await delay();
  return POPULAR_IDS.map((id) => MOCK_MOVIES.find((m) => m.id === id)).filter(Boolean) as Movie[];
}

export async function searchMovies(q: string): Promise<Movie[]> {
  if (!IS_MOCK) return request(`/movies/search?q=${encodeURIComponent(q)}`);
  await delay();
  const term = q.trim().toLowerCase();
  return MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(term));
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

export async function getSimilarMovies(movieId: number): Promise<Movie[]> {
  if (!IS_MOCK) return request(`/movies/${movieId}/similar`);
  await delay();
  const base = MOCK_MOVIES.find((m) => m.id === movieId);
  if (!base) return [];
  return MOCK_MOVIES.filter((m) => m.id !== movieId)
    .map((m) => {
      const shared = m.genres.filter((g) => base.genres.includes(g)).length;
      return { ...m, score: Math.min(0.98, 0.5 + shared * 0.15) };
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 8);
}
