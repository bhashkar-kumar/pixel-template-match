import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getPopular, searchMovies } from "@/lib/api";
import { useRatings } from "@/lib/ratings-context";
import { MovieCard, MovieCardSkeleton } from "@/components/MovieCard";
import { StarRating } from "@/components/StarRating";
import { EmptyState, ErrorState } from "@/components/StateViews";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Rate movies — CineMatch" },
      { name: "description", content: "Rate at least five movies so CineMatch can learn your taste." },
      { property: "og:title", content: "Rate movies — CineMatch" },
      { property: "og:description", content: "Rate at least five movies so CineMatch can learn your taste." },
    ],
  }),
  component: Onboarding,
});

const REQUIRED = 5;

function useDebounced<T>(value: T, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function Onboarding() {
  const [q, setQ] = useState("");
  const term = useDebounced(q.trim());
  const { ratings, setRating } = useRatings();
  const count = ratings.size;

  const movies = useQuery({
    queryKey: term ? ["search", term] : ["popular"],
    queryFn: () => (term ? searchMovies(term) : getPopular()),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-32 pt-10">
      <h1 className="font-display text-5xl sm:text-6xl">Rate what you've seen</h1>
      <p className="mt-2 text-muted-foreground">Rate at least {REQUIRED} movies. The more you rate, the sharper the picks.</p>

      <div className="relative mt-8 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search movies…"
          aria-label="Search movies"
          className="h-12 pl-10"
        />
      </div>

      <h2 className="mb-6 mt-10 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {term ? `Results for "${term}"` : "Popular movies"}
      </h2>

      {movies.isLoading ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => <MovieCardSkeleton key={i} />)}
        </div>
      ) : movies.error ? (
        <ErrorState message={movies.error.message} onRetry={() => movies.refetch()} />
      ) : !movies.data?.length ? (
        <EmptyState title={`No movies found for "${term}".`} />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {movies.data.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              footer={<StarRating label={m.title} value={ratings.get(m.id)?.rating ?? 0} onChange={(v) => setRating(m, v)} />}
            />
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <div className="flex-1">
            <p className="mb-1.5 text-sm font-medium" aria-live="polite">
              {Math.min(count, REQUIRED)} / {REQUIRED} rated{count > REQUIRED && ` (+${count - REQUIRED})`}
            </p>
            <Progress value={(Math.min(count, REQUIRED) / REQUIRED) * 100} aria-label="Rating progress" />
          </div>
          {count >= REQUIRED ? (
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/recommendations">Get recommendations</Link>
            </Button>
          ) : (
            <Button size="lg" disabled>Get recommendations</Button>
          )}
        </div>
      </div>
    </div>
  );
}
