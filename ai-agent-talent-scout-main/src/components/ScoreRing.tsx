import { cn } from "@/lib/utils";

interface ScoreRingProps {
  value: number; // 0-100
  size?: number;
  label?: string;
  variant?: "primary" | "accent" | "gradient";
  className?: string;
}

export function ScoreRing({ value, size = 64, label, variant = "primary", className }: ScoreRingProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;

  const colorClass =
    variant === "accent" ? "stroke-accent"
    : variant === "gradient" ? "stroke-[url(#scoreGrad)]"
    : "stroke-primary";

  return (
    <div className={cn("relative inline-flex flex-col items-center gap-1", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--accent))" />
            <stop offset="100%" stopColor="hsl(var(--primary))" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-secondary" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          className={cn(colorClass, "transition-all duration-700 ease-out")}
          fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono-tight text-base font-medium leading-none">{v}</span>
        {label && <span className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</span>}
      </div>
    </div>
  );
}
