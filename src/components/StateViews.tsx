import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Film } from "lucide-react";

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden />
      <p className="font-semibold">Something went wrong</p>
      <p className="max-w-sm text-sm text-muted-foreground">{message ?? "We couldn't load movies. Please try again."}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
      <Film className="h-8 w-8 text-muted-foreground" aria-hidden />
      <p className="font-semibold">{title}</p>
      {children}
    </div>
  );
}
