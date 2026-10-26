import type { Movie } from "@/types/movie";
import catalog from "./catalog.json";

/** The real 1,000-movie MovieLens catalog shipped with the backend (backend/artifacts/movies.csv). */
export const MOCK_MOVIES: Movie[] = catalog as Movie[];

export const POPULAR_IDS = [...MOCK_MOVIES]
  .sort((a, b) => (b.n_ratings ?? 0) - (a.n_ratings ?? 0))
  .slice(0, 24)
  .map((m) => m.id);
