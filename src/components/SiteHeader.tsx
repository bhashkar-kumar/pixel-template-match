import { Link } from "@tanstack/react-router";
import { IS_MOCK } from "@/lib/api";

const NAV = [
  { to: "/onboarding", label: "Rate" },
  { to: "/recommendations", label: "For you" },
  { to: "/demo", label: "Demo" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-2xl tracking-wider">
          <span aria-hidden>🎬</span>
          <span>Cine<span className="text-primary">Match</span></span>
        </Link>
        {IS_MOCK && (
          <span className="hidden rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary sm:inline">
            Demo mode (mock data)
          </span>
        )}
        <nav aria-label="Main" className="ml-auto flex gap-1 overflow-x-auto text-sm">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      {IS_MOCK && (
        <p className="border-t bg-primary/10 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-primary sm:hidden">
          Demo mode (mock data)
        </p>
      )}
    </header>
  );
}
