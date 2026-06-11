import type { SiteMeta } from "./types";

export type SiteConnection = SiteMeta & {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  prefix: string;
};

function clean(value: string | undefined, fallback = ""): string {
  if (value == null) return fallback;
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function siteKeys(): string[] {
  const raw = clean(process.env.THINKGRAPH_SITES, "techsprohub");
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getDefaultSiteKey(): string {
  const def = clean(process.env.THINKGRAPH_DEFAULT_SITE);
  const keys = siteKeys();
  if (def && keys.includes(def)) return def;
  return keys[0] ?? "techsprohub";
}

function connectionFor(key: string): SiteConnection {
  const up = key.toUpperCase();
  const env = (suffix: string) => clean(process.env[`SITE_${up}_${suffix}`]);
  return {
    key,
    label: env("LABEL") || key,
    url: env("URL"),
    host: env("HOST"),
    port: Number(env("PORT") || "3306"),
    user: env("USER"),
    password: clean(process.env[`SITE_${up}_PASSWORD`]),
    database: env("DATABASE"),
    prefix: env("PREFIX") || "wp_",
  };
}

/** All configured sites (metadata only — safe to expose to the client). */
export function getAvailableSites(): SiteMeta[] {
  return siteKeys().map((key) => {
    const c = connectionFor(key);
    return { key: c.key, label: c.label, url: c.url };
  });
}

/** Full connection (server-only — contains credentials). */
export function getSiteConnection(key?: string): SiteConnection {
  const k = key && siteKeys().includes(key) ? key : getDefaultSiteKey();
  return connectionFor(k);
}

export function isDemoMode(): boolean {
  return clean(process.env.THINKGRAPH_DEMO_MODE).toLowerCase() === "true";
}

export function isAiEnabled(): boolean {
  return Boolean(clean(process.env.ANTHROPIC_API_KEY));
}
