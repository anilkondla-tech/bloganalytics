"use client";

import { useState } from "react";
import type { ActionItem } from "@/lib/types";
import { ImpactPill } from "./ui";
import {
  IconWrite,
  IconLink,
  IconKey,
  IconSplit,
  IconRefresh,
  IconSparkle,
  IconCheck,
  IconExternal,
} from "./icons";

const TYPE_META: Record<
  ActionItem["type"],
  { icon: (p: { className?: string }) => JSX.Element; tint: string }
> = {
  write: { icon: IconWrite, tint: "text-accent-soft bg-accent/15" },
  link: { icon: IconLink, tint: "text-teal bg-teal/15" },
  keyword: { icon: IconKey, tint: "text-amber bg-amber/15" },
  cannibalization: { icon: IconSplit, tint: "text-rose bg-rose/15" },
  refresh: { icon: IconRefresh, tint: "text-slate-300 bg-white/10" },
};

type Status = "open" | "accepted" | "dismissed";

export default function ActionList({
  actions,
  siteKey,
  aiEnabled,
}: {
  actions: ActionItem[];
  siteKey: string;
  aiEnabled: boolean;
}) {
  const [items, setItems] = useState<ActionItem[]>(actions);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(false);

  const set = (id: string, s: Status) =>
    setStatus((prev) => ({ ...prev, [id]: prev[id] === s ? "open" : s }));

  const generateMore = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/analytics?ai=1&fresh=1&site=${encodeURIComponent(siteKey)}`
      );
      const data = await res.json();
      if (Array.isArray(data.actions)) {
        const existing = new Set(items.map((i) => i.id));
        const incoming = (data.actions as ActionItem[]).filter(
          (a) => !existing.has(a.id)
        );
        setItems((prev) => [...incoming, ...prev]);
      }
    } finally {
      setLoading(false);
    }
  };

  const accepted = Object.values(status).filter((s) => s === "accepted").length;
  const visible = items.filter((i) => status[i.id] !== "dismissed");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>
            <span className="font-semibold text-white">{visible.length}</span> open
          </span>
          <span>
            <span className="font-semibold text-teal">{accepted}</span> accepted
          </span>
        </div>
        {aiEnabled && (
          <button
            onClick={generateMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-3.5 py-2 text-sm font-medium text-accent-soft transition hover:bg-accent/20 disabled:opacity-60"
          >
            <IconSparkle className="h-4 w-4" />
            {loading ? "Thinking…" : "Generate more with AI"}
          </button>
        )}
      </div>

      <ul className="space-y-3">
        {visible.map((a) => {
          const meta = TYPE_META[a.type] ?? TYPE_META.write;
          const Icon = meta.icon;
          const isAccepted = status[a.id] === "accepted";
          return (
            <li
              key={a.id}
              className={`card card-pad flex gap-4 transition ${
                isAccepted ? "opacity-70 ring-1 ring-teal/30" : ""
              }`}
            >
              <span
                className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${meta.tint}`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{a.title}</h4>
                  {a.source === "ai" && (
                    <span className="pill bg-accent/15 text-accent-soft">
                      <IconSparkle className="h-3 w-3" /> AI
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  {a.rationale}
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <ImpactPill impact={a.impact} />
                  {a.cluster && (
                    <span className="pill bg-white/[0.05] text-slate-400">{a.cluster}</span>
                  )}
                  {a.targets?.map((t, i) =>
                    t.url ? (
                      <a
                        key={i}
                        href={t.url}
                        target="_blank"
                        rel="noreferrer"
                        className="pill bg-white/[0.05] text-slate-300 hover:text-white"
                      >
                        {t.label.length > 36 ? t.label.slice(0, 36) + "…" : t.label}
                        <IconExternal className="h-3 w-3" />
                      </a>
                    ) : null
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => set(a.id, "accepted")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    isAccepted
                      ? "bg-teal/20 text-teal"
                      : "bg-white/[0.05] text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <IconCheck className="h-3.5 w-3.5" />
                  {isAccepted ? "Accepted" : "Accept"}
                </button>
                <button
                  onClick={() => set(a.id, "dismissed")}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:text-rose"
                >
                  Dismiss
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && (
        <div className="card card-pad py-12 text-center text-sm text-slate-500">
          🎉 Nothing in the queue — every recommendation handled.
        </div>
      )}
    </div>
  );
}
