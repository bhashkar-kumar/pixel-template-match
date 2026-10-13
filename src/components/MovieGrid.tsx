import type { Movie } from "@/types/movie";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
import { ErrorState, EmptyState } from "./StateViews";

interface Props {
  movies?: Movie[] | undefined;
  isLoading: boolean;
  error?: Error | null | undefined;
  onRetry?: (() => void) | undefined;
  onSelect?: ((m: Movie) => void) | undefined;
  skeletonCount?: number;
}

const GRID = "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";

export function MovieGrid({ movies, isLoading, error, onRetry, onSelect, skeletonCount = 10 }: Props) {
  if (isLoading)
    return (
      <div className={GRID} aria-busy="true" aria-label="Loading movies">
        {Array.from({ length: skeletonCount }).map((_, i) => <MovieCardSkeleton key={i} />)}
      </div>
    );
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (!movies?.length) return <EmptyState title="No movies match these filters." />;
  return (
    <div className={GRID}>
      {movies.map((m) => <MovieCard key={m.id} movie={m} onSelect={onSelect} />)}
    </div>
  );
}
