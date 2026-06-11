# ThinkGraph AI

> See your content as a living knowledge graph. AI-ranked actions for topical authority, internal linking, and answer-engine (AEO) visibility.

ThinkGraph AI ingests a WordPress site's content, maps every post into a **topic → keyword → internal-link graph**, and surfaces the highest-leverage next moves: orphan pages to link, thin clusters to deepen, missing focus keywords, and keyword cannibalization — with optional Claude-powered strategy insights.

Built with **Next.js 14 (App Router) + TypeScript + Tailwind**. Deploys to **Vercel** with zero config. No heavy graph/chart libraries — the force graph and charts are hand-built SVG, so builds are fast and bulletproof.

> 📄 Product strategy & market research: see [`../THINKGRAPH_AI_RESEARCH.md`](../THINKGRAPH_AI_RESEARCH.md).

---

## Features

- **Overview** — graph health score (0–100), key metrics, publishing cadence, AI strategy insight.
- **Content Graph** — interactive force-style graph (pan / zoom / click). Orphans highlighted in red, clusters colored by category, node size = inbound links.
- **Clusters & Gaps** — per-cluster health (thin / healthy / crowded), internal-link density, orphan & missing-keyword counts.
- **Action Plan** — prioritized, explainable backlog with accept/dismiss and on-demand AI expansion.

---

## Architecture

```
src/
├── app/
│   ├── page.tsx            Overview
│   ├── graph/page.tsx      Content Graph
│   ├── clusters/page.tsx   Clusters & Gaps
│   ├── plan/page.tsx       Action Plan
│   └── api/
│       ├── analytics/route.ts   GET ?site=&ai=1&fresh=1
│       └── ping/route.ts        DB connectivity check
├── components/             Shell, GraphCanvas, charts, ui, ActionList, AiInsight, icons
└── lib/
    ├── sites.ts            multi-site config from env (server-only creds)
    ├── db.ts               mysql2 pools (server-only)
    ├── queries.ts          WordPress SQL → raw site data
    ├── analyze.ts          link-graph extraction, clusters, health, rule-based actions
    ├── ai.ts               Claude insight + extra actions (graceful degradation)
    ├── seed.ts             deterministic demo dataset (DB-blocked fallback)
    └── data.ts             orchestrator + 10-min cache
```

**Data flow:** Server components call `getSiteAnalytics()` → tries the live WordPress DB → on failure or `THINKGRAPH_DEMO_MODE=true`, falls back to the bundled demo dataset → runs deterministic analysis → optionally merges Claude insights.

---

## Local development

```bash
cd thinkgraph
npm install
cp .env.example .env.local   # fill in your DB creds (already done locally)
npm run dev                  # http://localhost:3000
```

Without `ANTHROPIC_API_KEY`, everything works except the AI insight cards (they show a clear "add a key" hint).

To preview without any DB access, set `THINKGRAPH_DEMO_MODE=true`.

---

## Deploy to Vercel (via GitHub)

1. Push this repo to GitHub. **`.env*` files are git-ignored — credentials never leave your machine.**
2. In Vercel → **New Project** → import the repo.
3. Set **Root Directory = `thinkgraph`** (this app lives in a subfolder).
4. Framework preset auto-detects **Next.js**. Build command `next build`, output handled automatically.
5. Add **Environment Variables** (copy the keys from `.env.example`): the `SITE_*` blocks, `THINKGRAPH_SITES`, `THINKGRAPH_DEFAULT_SITE`, and optionally `ANTHROPIC_API_KEY`.
6. Deploy.

### ⚠️ Hostinger ↔ Vercel database access
Hostinger shared MySQL often restricts remote connections to whitelisted IPs, and Vercel functions use **dynamic IPs**. If live DB connections fail in production, the app **automatically renders the demo dataset** (you'll see a "Demo data" badge) so the deploy never breaks. To use live data in production, either:
- add wildcard/Vercel ranges in Hostinger → **Remote MySQL**, or
- front the DB with a proxy that has a static egress IP, or
- keep `THINKGRAPH_DEMO_MODE=true` for the public deploy and run live data only from an allowlisted environment.

---

## Security notes

- All DB credentials are **server-only** (`import "server-only"` guards `db.ts`, `queries.ts`, `ai.ts`). They are never bundled to the client.
- `.env`, `.env.local`, `.env.*` are git-ignored; only `.env.example` (no secrets) is committed.
- Recommended: rotate the WordPress DB passwords once wired, since they previously sat in plaintext defaults in the legacy Flask `config.py`.
