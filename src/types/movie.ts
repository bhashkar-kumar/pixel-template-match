export interface Movie {
  id: number;
  title: string;
  year: number;
  genres: string[];
  poster_url?: string;
  overview?: string;
  score?: number;
}

export interface Rating {
  movie_id: number;
  rating: number;
}
