import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getRecommendationsForNewUser } from "@/lib/api";
import { useRatings } from "@/lib/ratings-context";
import { RecommendationsView } from "@/components/RecommendationsView";
import { EmptyState } from "@/components/StateViews";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Your recommendations — CineMatch" },
      { name: "description", content: "Your personal movie picks with predicted match scores." },
      { property: "og:title", content: "Your recommendations — CineMatch" },
      { property: "og:description", content: "Your personal movie picks with predicted match scores." },
    ],
  }),
  component: Recommendations,
});

function Recommendations() {
  const { ratings } = useRatings();
  const [topN, setTopN] = useState(20);
  const payload = Array.from(ratings.values()).map((r) => ({ movie_id: r.movie.id, rating: r.rating }));
  const query = useQuery({
    queryKey: ["recs-new", payload, topN],
    queryFn: () => getRecommendationsForNewUser(payload, topN),
    enabled: payload.length >= 5,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-5xl sm:text-6xl">Picked for you</h1>
      <p className="mb-8 mt-2 text-muted-foreground">Based on your {payload.length} ratings.</p>
      {payload.length < 5 ? (
        <EmptyState title="Rate at least 5 movies first.">
          <Button asChild><Link to="/onboarding">Start rating</Link></Button>
        </EmptyState>
      ) : (
        <RecommendationsView query={query} topN={topN} onTopNChange={setTopN} />
      )}
    </div>
  );
}
