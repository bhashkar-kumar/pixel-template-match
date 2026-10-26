export interface Movie {
  id: number;
  title: string;
  year?: number | null | undefined;
  genres: string[];
  poster_url?: string | null | undefined;
  overview?: string | null | undefined;
  score?: number | null | undefined;
  n_ratings?: number | undefined;
  avg_rating?: number | undefined;
}

export interface Rating {
  movie_id: number;
  rating: number;
}
