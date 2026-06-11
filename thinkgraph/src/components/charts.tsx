// Lightweight, dependency-free SVG charts — server-renderable.

const PALETTE = [
  "#7c6cff",
  "#3ad6c5",
  "#ffb454",
  "#ff6b8b",
  "#5b9bff",
  "#b07cff",
  "#4fd17a",
  "#ff9f6b",
  "#6be0ff",
  "#e06bd1",
];

export function BarList({
  data,
  valueLabel,
}: {
  data: { label: string; value: number }[];
  valueLabel?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-sm text-slate-300">{d.label}</span>
            <span className="shrink-0 text-xs tabular-nums text-slate-500">
              {d.value.toLocaleString()}
              {valueLabel ? ` ${valueLabel}` : ""}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${PALETTE[i % PALETTE.length]}, ${PALETTE[i % PALETTE.length]}aa)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function WeeklyTrend({
  data,
}: {
  data: { week: string; count: number }[];
}) {
  const w = 680;
  const h = 160;
  const pad = 8;
  if (data.length === 0) {
    return <div className="py-10 text-center text-sm text-slate-600">No publishing data</div>;
  }
  const max = Math.max(1, ...data.map((d) => d.count));
  const stepX = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const x = (i: number) => pad + i * stepX;
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2);

  const line = data.map((d, i) => `${x(i)},${y(d.count)}`).join(" ");
  const area = `${pad},${h - pad} ${line} ${x(data.length - 1)},${h - pad}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7c6cff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#7c6cff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#trendFill)" />
      <polyline
        points={line}
        fill="none"
        stroke="#a99bff"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => (
        <circle key={d.week} cx={x(i)} cy={y(d.count)} r="1.6" fill="#cfc7ff" />
      ))}
    </svg>
  );
}

export function Donut({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  let acc = 0;
  const r = 56;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90 shrink-0">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * c;
          const seg = (
            <circle
              key={d.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth="16"
              strokeDasharray={`${dash} ${c}`}
              strokeDashoffset={-acc * c}
            />
          );
          acc += frac;
          return seg;
        })}
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-slate-300">{d.label}</span>
            <span className="text-slate-500">{d.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PALETTE };
