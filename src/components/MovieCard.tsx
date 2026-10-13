import type { ReactNode } from "react";
import type { Movie } from "@/types/movie";
import { MoviePoster } from "./MoviePoster";
import { MatchRing } from "./MatchRing";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  movie: Movie;
  onSelect?: ((movie: Movie) => void) | undefined;
  footer?: ReactNode;
}

export function MovieCard({ movie, onSelect, footer }: Props) {
  const body = (
    <>
      <div className="relative">
        <MoviePoster
          movie={movie}
          className="shadow-card transition-transform duration-300 group-hover:scale-[1.03] group-hover:shadow-glow"
        />
        {movie.score != null && (
          <div className="absolute right-2 top-2">
            <MatchRing score={movie.score} />
          </div>
        )}
      </div>
      <div className="mt-3 space-y-1.5 text-left">
        <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
          {movie.title}
        </h3>
        <p className="text-xs text-muted-foreground">{movie.year}</p>
        <div className="flex flex-wrap gap-1">
          {movie.genres.slice(0, 3).map((g) => (
            <span key={g} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
              {g}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="group w-full">
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(movie)}
          className="block w-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
          aria-label={`View details for ${movie.title}`}
        >
          {body}
        </button>
      ) : (
        body
      )}
      {footer && <div className="mt-2">{footer}</div>}
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  );
}
