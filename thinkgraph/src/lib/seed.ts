import type { SiteMeta } from "./types";
import type { RawPost, RawSite } from "./queries";

// Deterministic pseudo-random so the demo graph is stable across renders.
function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const CATEGORIES: Record<string, string[]> = {
  "AI & Machine Learning": [
    "A Practical Guide to Retrieval-Augmented Generation",
    "Fine-Tuning vs Prompt Engineering: What Actually Works",
    "Building Your First AI Agent in an Afternoon",
    "Vector Databases Explained for Builders",
    "How LLM Context Windows Really Work",
    "Evaluating AI Output Without Losing Your Mind",
    "The Economics of Running Models in Production",
    "Multi-Agent Systems: Hype vs Reality",
  ],
  "Web Development": [
    "Server Components Changed How I Build Apps",
    "The State of CSS in 2026",
    "Edge Functions: When and Why",
    "TypeScript Patterns I Wish I Knew Earlier",
    "Shipping Fast Without Breaking Things",
    "A Calm Take on Framework Fatigue",
  ],
  "Cloud & DevOps": [
    "Zero-Downtime Deploys on a Budget",
    "Observability for Small Teams",
    "Infrastructure as Code Without the Tears",
    "Cutting Your Cloud Bill in Half",
  ],
  Cybersecurity: [
    "Threat Modeling for Indie Developers",
    "Secrets Management Done Right",
    "The Beginner's Guide to Zero Trust",
    "Why Your API Keys Keep Leaking",
  ],
  Gadgets: [
    "The Best Mechanical Keyboards This Year",
    "E-Ink Tablets Are Finally Good",
    "A Minimalist's Desk Setup",
  ],
  Startups: [
    "Finding Your First 100 Users",
    "Pricing a Micro-SaaS Without Guessing",
    "The One-Person Software Company Playbook",
    "When to Charge Before You Build",
  ],
};

const AUTHORS = ["Veena", "Arjun", "Maya", "Dev"];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const DEMO_SITE: SiteMeta = {
  key: "demo",
  label: "Demo — Northstar Tech",
  url: "https://demo.thinkgraph.app",
};

export function buildDemoRawSite(): RawSite {
  const rand = lcg(42);
  const posts: RawPost[] = [];
  const categoriesByPost = new Map<number, string[]>();
  const keywordByPost = new Map<number, string>();

  let id = 100;
  const now = Date.now();

  const entries: { title: string; cat: string }[] = [];
  for (const [cat, titles] of Object.entries(CATEGORIES)) {
    for (const title of titles) entries.push({ title, cat });
  }

  // First pass: create posts (without content links yet)
  const meta = entries.map((e, idx) => {
    const pid = id++;
    const slug = slugify(e.title);
    const daysAgo = Math.floor(rand() * 360);
    const date = new Date(now - daysAgo * 86400000).toISOString();
    categoriesByPost.set(pid, [e.cat]);
    // ~25% of posts have no focus keyword
    if (rand() > 0.25) {
      keywordByPost.set(pid, e.title.split(":")[0].split(" ").slice(0, 3).join(" ").toLowerCase());
    }
    return { pid, slug, title: e.title, cat: e.cat, date, idx };
  });

  // Second pass: build content with internal links to same/adjacent category posts.
  // Intentionally leave a few posts with zero inbound links (orphans).
  meta.forEach((m, i) => {
    const sameCat = meta.filter((o) => o.cat === m.cat && o.pid !== m.pid);
    const linkCount = Math.floor(rand() * 3); // 0..2 links
    const links: string[] = [];
    for (let k = 0; k < linkCount && sameCat.length; k++) {
      const target = sameCat[Math.floor(rand() * sameCat.length)];
      links.push(
        `<a href="${DEMO_SITE.url}/${target.slug}/">${target.title}</a>`
      );
    }
    const content = `<p>${m.title} — an in-depth look at ${m.cat.toLowerCase()}.</p>
      <p>Related reading: ${links.join(" · ") || "(no internal links yet)"}</p>`;
    posts.push({
      id: m.pid,
      title: m.title,
      slug: m.slug,
      date: m.date,
      status: "publish",
      author_id: i % AUTHORS.length,
      content,
    });
  });

  const authors = new Map<number, string>();
  AUTHORS.forEach((name, i) => authors.set(i, name));

  const statusCounts = [
    { status: "publish", count: posts.length },
    { status: "draft", count: 7 },
    { status: "pending", count: 2 },
  ];

  return {
    posts,
    authors,
    categoriesByPost,
    keywordByPost,
    statusCounts,
    totalPosts: posts.length + 9,
    totalComments: 1284,
  };
}
