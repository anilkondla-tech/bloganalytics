// Shared domain types for ThinkGraph AI.

export type SiteMeta = {
  key: string;
  label: string;
  url: string;
};

export type PostStatus = "publish" | "draft" | "pending" | "future" | "private" | string;

export type GraphNode = {
  id: string; // post id as string
  label: string;
  slug: string;
  category: string;
  keyword: string | null;
  author: string;
  status: PostStatus;
  date: string; // ISO
  inDegree: number;
  outDegree: number;
  orphan: boolean; // no inbound internal links
};

export type GraphEdge = {
  source: string;
  target: string;
};

export type Cluster = {
  category: string;
  postCount: number;
  internalLinks: number; // edges fully inside this cluster
  linkDensity: number; // edges / posts
  orphanCount: number;
  missingKeywordCount: number;
  health: "thin" | "healthy" | "crowded";
};

export type ActionType =
  | "write"
  | "link"
  | "keyword"
  | "cannibalization"
  | "refresh";

export type ActionItem = {
  id: string;
  type: ActionType;
  title: string;
  rationale: string;
  impact: "high" | "medium" | "low";
  cluster?: string;
  targets?: { label: string; url?: string }[];
  source: "rule" | "ai";
};

export type SiteAnalytics = {
  site: SiteMeta;
  source: "live" | "demo";
  generatedAt: string;
  totals: {
    posts: number;
    publishedPosts: number;
    comments: number;
    categories: number;
    authors: number;
    orphans: number;
    missingKeywords: number;
    internalLinks: number;
  };
  healthScore: number; // 0-100
  statusBreakdown: { status: string; count: number }[];
  postsByWeek: { week: string; count: number }[];
  clusters: Cluster[];
  graph: { nodes: GraphNode[]; edges: GraphEdge[] };
  topCategories: { category: string; count: number }[];
  actions: ActionItem[];
  aiInsight: string | null;
  aiEnabled: boolean;
};
