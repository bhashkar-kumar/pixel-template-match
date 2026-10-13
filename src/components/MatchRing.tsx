export function MatchRing({ score, size = 44 }: { score: number; size?: number }) {
  const pct = Math.round(score * 100);
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative grid place-items-center rounded-full bg-background/85 backdrop-blur"
      style={{ width: size, height: size }}
      aria-label={`${pct}% match`}
      role="img"
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score)}
          className="stroke-primary"
        />
      </svg>
      <span className="text-[11px] font-bold text-foreground">{pct}%</span>
    </div>
  );
}
