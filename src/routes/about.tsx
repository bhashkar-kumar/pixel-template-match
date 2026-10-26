import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import metricsJson from "@/lib/metrics.json";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CineMatch" },
      { name: "description", content: "How CineMatch uses Neural Collaborative Filtering (NeuMF) to recommend movies." },
      { property: "og:title", content: "About — CineMatch" },
      { property: "og:description", content: "How CineMatch uses Neural Collaborative Filtering (NeuMF)." },
    ],
  }),
  component: About,
});

type Metric = { test_rmse?: number | null; test_mae?: number | null; HR10?: number | null; NDCG10?: number | null };
const METRICS = metricsJson as Record<string, Metric>;

const STACK = ["PyTorch", "FastAPI", "React", "TypeScript", "TanStack", "Tailwind CSS", "shadcn/ui"];

function Box({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold sm:text-sm ${accent ? "border-primary bg-primary/15 text-primary" : "bg-card"}`}>
      {children}
    </div>
  );
}

function Arrow() {
  return <div className="mx-auto h-5 w-px bg-border" aria-hidden />;
}

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-12">
      <section>
        <h1 className="font-display text-6xl">About CineMatch</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          CineMatch is a movie recommender built on <strong className="text-foreground">Neural Collaborative Filtering (NCF)</strong>.
          Instead of a fixed dot product between user and item vectors, NCF learns the interaction function with a neural network.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-4xl">The NeuMF architecture</h2>
        <p className="text-muted-foreground">
          NeuMF fuses two branches: <strong className="text-foreground">GMF</strong> (generalized matrix factorization, an element-wise
          product of embeddings) captures linear interactions, and an <strong className="text-foreground">MLP</strong> captures non-linear
          ones. Their outputs are concatenated and passed to a final layer that predicts the match score.
        </p>
        <figure aria-label="NeuMF architecture diagram" className="rounded-2xl border bg-surface p-6">
          <Box accent>Predicted score ŷ (sigmoid)</Box>
          <Arrow />
          <Box>NeuMF layer · concatenate</Box>
          <div className="grid grid-cols-2 gap-6">
            <div><Arrow /><Box>GMF · u ⊙ i</Box><Arrow /><div className="grid grid-cols-2 gap-2"><Box>User emb.</Box><Box>Item emb.</Box></div></div>
            <div><Arrow /><Box>MLP · 64 → 32 → 16</Box><Arrow /><div className="grid grid-cols-2 gap-2"><Box>User emb.</Box><Box>Item emb.</Box></div></div>
          </div>
          <Arrow />
          <div className="grid grid-cols-2 gap-6"><Box>User ID</Box><Box>Movie ID</Box></div>
        </figure>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-4xl">Results</h2>
        <p className="text-muted-foreground">Evaluated on a held-out MovieLens 100K test split (943 users, 1,000 movies).</p>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Model</TableHead><TableHead>RMSE</TableHead><TableHead>MAE</TableHead><TableHead>HR@10</TableHead><TableHead>NDCG@10</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(METRICS).map(([name, m]) => {
                const best = name.startsWith("NeuMF");
                const f = (v: number | null | undefined) => (v == null ? "—" : v.toFixed(3));
                return (
                  <TableRow key={name}>
                    <TableCell className={best ? "font-semibold text-primary" : ""}>{name}</TableCell>
                    <TableCell className={best ? "font-semibold" : ""}>{f(m.test_rmse)}</TableCell>
                    <TableCell className={best ? "font-semibold" : ""}>{f(m.test_mae)}</TableCell>
                    <TableCell>{f(m.HR10)}</TableCell>
                    <TableCell>{f(m.NDCG10)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground">NeuMF gives the most accurate rating predictions (lowest RMSE/MAE). Lower RMSE/MAE is better; higher HR/NDCG is better.</p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-4xl">Tech stack</h2>
        <ul className="flex flex-wrap gap-2">
          {STACK.map((s) => <li key={s} className="rounded-full border px-3 py-1 text-sm">{s}</li>)}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-4xl">Credits</h2>
        <p className="text-muted-foreground">
          Ratings data from <a className="text-primary underline-offset-4 hover:underline" href="https://grouplens.org/datasets/movielens/" target="_blank" rel="noreferrer">MovieLens by GroupLens</a>.
          Posters from <a className="text-primary underline-offset-4 hover:underline" href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDB</a>.
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
        <Button asChild variant="outline">
          <a href="https://github.com/your-username/cinematch" target="_blank" rel="noreferrer"><Github className="h-4 w-4" /> View on GitHub</a>
        </Button>
      </section>
    </div>
  );
}
