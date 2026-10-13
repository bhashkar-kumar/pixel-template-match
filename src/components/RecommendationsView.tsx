import { useMemo, useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import type { Movie } from "@/types/movie";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { MovieGrid } from "./MovieGrid";
import { MovieDetailModal } from "./MovieDetailModal";

interface Props {
  query: UseQueryResult<Movie[], Error>;
  topN: number;
  onTopNChange: (n: number) => void;
}

export function RecommendationsView({ query, topN, onTopNChange }: Props) {
  const [genre, setGenre] = useState<string | null>(null);
  const [selected, setSelected] = useState<Movie | null>(null);

  const genres = useMemo(
    () => Array.from(new Set(query.data?.flatMap((m) => m.genres) ?? [])).sort(),
    [query.data],
  );
  const filtered = genre ? query.data?.filter((m) => m.genres.includes(genre)) : query.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(topN)} onValueChange={(v) => onTopNChange(Number(v))}>
          <SelectTrigger className="w-32" aria-label="Number of recommendations">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30].map((n) => <SelectItem key={n} value={String(n)}>Top {n}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => query.refetch()} disabled={query.isFetching}>
          <RefreshCw className={cn("h-4 w-4", query.isFetching && "animate-spin")} /> Refresh
        </Button>
      </div>

      {genres.length > 0 && (
        <div role="group" aria-label="Filter by genre" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
          {[null, ...genres].map((g) => (
            <button
              key={g ?? "all"}
              type="button"
              aria-pressed={genre === g}
              onClick={() => setGenre(g)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                genre === g ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/60",
              )}
            >
              {g ?? "All"}
            </button>
          ))}
        </div>
      )}

      <MovieGrid
        movies={filtered}
        isLoading={query.isLoading || (query.isFetching && !query.data)}
        error={query.error}
        onRetry={() => query.refetch()}
        onSelect={setSelected}
        skeletonCount={topN}
      />
      <MovieDetailModal movie={selected} onClose={() => setSelected(null)} onSelect={setSelected} />
    </div>
  );
}
