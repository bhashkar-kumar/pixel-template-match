import { useQuery } from "@tanstack/react-query";
import type { Movie } from "@/types/movie";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getSimilarMovies } from "@/lib/api";
import { MoviePoster } from "./MoviePoster";
import { MovieRow } from "./MovieRow";
import { MatchRing } from "./MatchRing";

interface Props {
  movie: Movie | null;
  onClose: () => void;
  onSelect: (m: Movie) => void;
}

export function MovieDetailModal({ movie, onClose, onSelect }: Props) {
  const similar = useQuery({
    queryKey: ["similar", movie?.id],
    queryFn: () => getSimilarMovies(movie!.id),
    enabled: !!movie,
  });

  return (
    <Dialog open={!!movie} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-border bg-popover p-0">
        {movie && (
          <>
            <div className="bg-hero grid gap-6 p-6 sm:grid-cols-[220px_1fr] sm:p-8">
              <MoviePoster movie={movie} className="mx-auto max-w-[220px] shadow-card" />
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="font-display text-4xl leading-none sm:text-5xl">{movie.title}</DialogTitle>
                    <p className="mt-2 text-sm text-muted-foreground">{movie.year}</p>
                  </div>
                  {movie.score != null && <MatchRing score={movie.score} size={60} />}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {movie.genres.map((g) => (
                    <span key={g} className="rounded-full border px-2.5 py-0.5 text-xs">{g}</span>
                  ))}
                </div>
                <DialogDescription className="text-sm leading-relaxed text-foreground/80">
                  {movie.overview ?? "No overview available for this title."}
                </DialogDescription>
              </div>
            </div>
            <div className="px-6 pb-6 sm:px-8">
              <h4 className="mb-4 font-display text-2xl">Similar movies</h4>
              <MovieRow
                label="Similar movies"
                movies={similar.data}
                isLoading={similar.isLoading}
                error={similar.error}
                onRetry={() => similar.refetch()}
                onSelect={onSelect}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
