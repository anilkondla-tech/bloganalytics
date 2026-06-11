import "server-only";
import { analyzeSite } from "./analyze";
import { generateAiInsight } from "./ai";
import { fetchRawSite } from "./queries";
import { buildDemoRawSite, DEMO_SITE } from "./seed";
import {
  getAvailableSites,
  getDefaultSiteKey,
  getSiteConnection,
  isAiEnabled,
  isDemoMode,
} from "./sites";
import type { SiteAnalytics, SiteMeta } from "./types";

type CacheEntry = { value: SiteAnalytics; expires: number };
const CACHE = new Map<string, CacheEntry>();
const TTL_MS = 1000 * 60 * 10; // 10 minutes

function metaFor(siteKey: string): SiteMeta {
  const c = getSiteConnection(siteKey);
  return { key: c.key, label: c.label, url: c.url };
}

export function listSites(): SiteMeta[] {
  if (isDemoMode()) return [DEMO_SITE];
  const sites = getAvailableSites();
  return sites.length ? sites : [DEMO_SITE];
}

export function resolveSiteKey(requested?: string | null): string {
  if (isDemoMode()) return "demo";
  const sites = getAvailableSites().map((s) => s.key);
  if (requested && sites.includes(requested)) return requested;
  return getDefaultSiteKey();
}

export async function getSiteAnalytics(
  requestedKey?: string | null,
  opts: { withAi?: boolean; fresh?: boolean } = {}
): Promise<SiteAnalytics> {
  const withAi = opts.withAi ?? false;
  const siteKey = resolveSiteKey(requestedKey);
  const cacheKey = `${siteKey}:${withAi ? "ai" : "base"}`;

  if (!opts.fresh) {
    const hit = CACHE.get(cacheKey);
    if (hit && hit.expires > Date.now()) return hit.value;
  }

  let analytics: SiteAnalytics;

  const demo = isDemoMode();
  if (demo) {
    analytics = analyzeSite(DEMO_SITE, buildDemoRawSite(), "demo", isAiEnabled());
  } else {
    try {
      const raw = await fetchRawSite(siteKey);
      analytics = analyzeSite(metaFor(siteKey), raw, "live", isAiEnabled());
    } catch (err) {
      // DB unreachable (common: Hostinger blocks Vercel IPs) → graceful demo fallback.
      console.error(`[thinkgraph] DB fetch failed for "${siteKey}", using demo data:`, err);
      analytics = analyzeSite(
        { ...DEMO_SITE, label: `${metaFor(siteKey).label} (demo fallback)` },
        buildDemoRawSite(),
        "demo",
        isAiEnabled()
      );
    }
  }

  if (withAi && analytics.aiEnabled) {
    const ai = await generateAiInsight(analytics);
    if (ai) {
      analytics = {
        ...analytics,
        aiInsight: ai.insight || null,
        actions: mergeActions(analytics.actions, ai.actions),
      };
    }
  }

  CACHE.set(cacheKey, { value: analytics, expires: Date.now() + TTL_MS });
  return analytics;
}

function mergeActions(
  ruleActions: SiteAnalytics["actions"],
  aiActions: SiteAnalytics["actions"]
): SiteAnalytics["actions"] {
  const rank = { high: 0, medium: 1, low: 2 };
  return [...aiActions, ...ruleActions].sort(
    (a, b) => rank[a.impact] - rank[b.impact]
  );
}
