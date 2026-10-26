import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Brain, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPopular } from "@/lib/api";
import { MovieRow } from "@/components/MovieRow";
import { MovieDetailModal } from "@/components/MovieDetailModal";
import type { Movie } from "@/types/movie";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CineMatch — Find your next favorite movie" },
      { name: "description", content: "Rate a few movies and let a Neural Collaborative Filtering model learn your taste." },
      { property: "og:title", content: "CineMatch — Find your next favorite movie" },
      { property: "og:description", content: "Rate a few movies and let a neural model learn your taste." },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: Star, title: "Rate movies", text: "Tell us how you feel about at least five films." },
  { icon: Brain, title: "Model learns your taste", text: "A NeuMF network maps you into a shared taste space." },
  { icon: Sparkles, title: "Get recommendations", text: "See ranked picks with a predicted match score." },
];

function Home() {
  const popular = useQuery({ queryKey: ["popular"], queryFn: () => getPopular() });
  const [selected, setSelected] = useState<Movie | null>(null);

  return (
    <>
      <section className="bg-hero film-grain">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-32">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">Neural Collaborative Filtering</p>
          <h1 className="max-w-4xl font-display text-6xl leading-[0.9] sm:text-8xl lg:text-9xl">
            Movies picked by a network that gets you.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Rate five films. Our model blends matrix factorization with a deep network to predict what you'll love next.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="shadow-glow">
              <Link to="/onboarding">Get my recommendations</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/demo">Try a demo user</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="mb-6 font-display text-4xl">Popular right now</h2>
        <MovieRow
          label="Popular movies"
          movies={popular.data}
          isLoading={popular.isLoading}
          error={popular.error}
          onRetry={() => popular.refetch()}
          onSelect={setSelected}
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <h2 className="mb-8 font-display text-4xl">How it works</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl border bg-card p-6 transition-colors hover:border-primary/50">
              <div className="flex items-center gap-3">
                <span className="font-display text-5xl text-primary/40">0{i + 1}</span>
                <s.icon className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>
      <MovieDetailModal movie={selected} onClose={() => setSelected(null)} onSelect={setSelected} />
    </>
  );
}
