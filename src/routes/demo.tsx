import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRecommendationsForUser } from "@/lib/api";
import { RecommendationsView } from "@/components/RecommendationsView";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo users — CineMatch" },
      { name: "description", content: "Explore recommendations for any of the 943 MovieLens users." },
      { property: "og:title", content: "Demo users — CineMatch" },
      { property: "og:description", content: "Explore recommendations for any of the 943 MovieLens users." },
    ],
  }),
  component: Demo,
});

const MAX_USER = 943;

function Demo() {
  const [input, setInput] = useState("42");
  const [userId, setUserId] = useState(42);
  const [topN, setTopN] = useState(20);
  const parsed = Number(input);
  const valid = Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_USER;

  const query = useQuery({
    queryKey: ["recs-user", userId, topN],
    queryFn: () => getRecommendationsForUser(userId, topN),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) setUserId(parsed);
  };
  const random = () => {
    const id = Math.floor(Math.random() * MAX_USER) + 1;
    setInput(String(id));
    setUserId(id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-5xl sm:text-6xl">Demo user #{userId}</h1>
      <p className="mt-2 text-muted-foreground">Pick any MovieLens 100K user (1–{MAX_USER}) to see what the model predicts for them.</p>

      <form onSubmit={submit} className="mb-8 mt-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="user-id">User ID</Label>
          <Input
            id="user-id"
            type="number"
            min={1}
            max={MAX_USER}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-32"
            aria-invalid={!valid}
          />
        </div>
        <Button type="submit" disabled={!valid}>Show picks</Button>
        <Button type="button" variant="outline" onClick={random}><Shuffle className="h-4 w-4" /> Random</Button>
        {!valid && <p className="w-full text-sm text-destructive">Enter a number between 1 and {MAX_USER}.</p>}
      </form>

      <RecommendationsView query={query} topN={topN} onTopNChange={setTopN} />
    </div>
  );
}
