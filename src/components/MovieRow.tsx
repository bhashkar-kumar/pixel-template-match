import type { Movie } from "@/types/movie";
import { MovieCard, MovieCardSkeleton } from "./MovieCard";
import { ErrorState } from "./StateViews";

interface Props {
  movies?: Movie[] | undefined;
  isLoading: boolean;
  error?: Error | null | undefined;
  onRetry?: (() => void) | undefined;
  onSelect?: ((m: Movie) => void) | undefined;
  label: string;
}

export function MovieRow({ movies, isLoading, error, onRetry, onSelect, label }: Props) {
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  return (
    <div
      role="list"
      aria-label={label}
      className="scrollbar-none -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4"
    >
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} role="listitem" className="w-36 shrink-0 sm:w-44"><MovieCardSkeleton /></div>
          ))
        : movies?.map((m) => (
            <div key={m.id} role="listitem" className="w-36 shrink-0 snap-start sm:w-44">
              <MovieCard movie={m} onSelect={onSelect} />
            </div>
          ))}
    </div>
  );
}
