import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SourceBadge({ source }: { source: "live" | "demo" }) {
  if (source === "live") {
    return (
      <span className="pill bg-teal/15 text-teal">
        <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulseglow" />
        Live data
      </span>
    );
  }
  return (
    <span className="pill bg-amber/15 text-amber">
      <span className="h-1.5 w-1.5 rounded-full bg-amber" />
      Demo data
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass =
    tone === "good"
      ? "text-teal"
      : tone === "warn"
        ? "text-amber"
        : tone === "bad"
          ? "text-rose"
          : "text-white";
  return (
    <div className="card card-pad animate-fade-up">
      <div className="label-muted">{label}</div>
      <div className={`mt-2 text-3xl font-semibold tracking-tight ${toneClass}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;
  const color = score >= 75 ? "#3ad6c5" : score >= 50 ? "#ffb454" : "#ff6b8b";
  return (
    <div className="relative grid place-items-center">
      <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90">
        <circle cx="74" cy="74" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" />
        <circle
          cx="74"
          cy="74"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold text-white">{score}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          / 100
        </div>
      </div>
    </div>
  );
}

const HEALTH_STYLE: Record<string, string> = {
  thin: "bg-rose/15 text-rose",
  healthy: "bg-teal/15 text-teal",
  crowded: "bg-amber/15 text-amber",
};

export function HealthPill({ health }: { health: string }) {
  return (
    <span className={`pill ${HEALTH_STYLE[health] ?? "bg-white/10 text-slate-300"}`}>
      {health}
    </span>
  );
}

const IMPACT_STYLE: Record<string, string> = {
  high: "bg-rose/15 text-rose",
  medium: "bg-amber/15 text-amber",
  low: "bg-white/10 text-slate-400",
};

export function ImpactPill({ impact }: { impact: string }) {
  return <span className={`pill ${IMPACT_STYLE[impact]}`}>{impact} impact</span>;
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="card card-pad grid place-items-center py-14 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}
