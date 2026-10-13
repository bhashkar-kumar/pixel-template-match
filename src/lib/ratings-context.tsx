import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Movie } from "@/types/movie";

interface RatingsValue {
  ratings: Map<number, { movie: Movie; rating: number }>;
  setRating: (movie: Movie, rating: number) => void;
}

const RatingsContext = createContext<RatingsValue | null>(null);

export function RatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState(new Map<number, { movie: Movie; rating: number }>());
  const value = useMemo<RatingsValue>(
    () => ({
      ratings,
      setRating: (movie, rating) =>
        setRatings((prev) => {
          const next = new Map(prev);
          if (rating === 0) next.delete(movie.id);
          else next.set(movie.id, { movie, rating });
          return next;
        }),
    }),
    [ratings],
  );
  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error("useRatings must be used within RatingsProvider");
  return ctx;
}
