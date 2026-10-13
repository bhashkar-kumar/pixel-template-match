import { useState } from "react";
import type { Movie } from "@/types/movie";
import { cn } from "@/lib/utils";

const HUES = [20, 45, 70, 200, 260, 330, 150];

export function MoviePoster({ movie, className }: { movie: Movie; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImg = movie.poster_url && !failed;
  const hue = HUES[movie.id % HUES.length] ?? 45;

  return (
    <div className={cn("relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted", className)}>
      {showImg ? (
        <img
          src={movie.poster_url}
          alt={`Poster for ${movie.title}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={`Placeholder poster for ${movie.title}`}
          className="film-grain flex h-full w-full flex-col justify-end p-3"
          style={{
            backgroundImage: `linear-gradient(160deg, oklch(0.45 0.12 ${hue}) 0%, oklch(0.2 0.05 ${hue + 30}) 60%, oklch(0.12 0.01 50) 100%)`,
          }}
        >
          <span className="font-display text-2xl leading-none text-foreground/90 line-clamp-3 sm:text-3xl">
            {movie.title}
          </span>
          <span className="mt-1 text-xs text-foreground/60">{movie.year}</span>
        </div>
      )}
    </div>
  );
}
