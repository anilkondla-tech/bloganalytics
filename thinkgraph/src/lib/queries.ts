import "server-only";
import { query } from "./db";
import { getSiteConnection } from "./sites";

const POST_LIMIT = 600; // cap content-bearing rows to keep the shared DB happy

export type RawPost = {
  id: number;
  title: string;
  slug: string;
  date: string;
  status: string;
  author_id: number;
  content: string;
};

export type RawSite = {
  posts: RawPost[];
  authors: Map<number, string>;
  categoriesByPost: Map<number, string[]>;
  keywordByPost: Map<number, string>;
  statusCounts: { status: string; count: number }[];
  totalPosts: number;
  totalComments: number;
};

export async function fetchRawSite(siteKey: string): Promise<RawSite> {
  const p = getSiteConnection(siteKey).prefix;

  // Published posts with content (for the graph + link extraction).
  const posts = await query<{
    ID: number;
    post_title: string;
    post_name: string;
    post_date: Date | string;
    post_status: string;
    post_author: number;
    post_content: string;
  }>(
    siteKey,
    `SELECT ID, post_title, post_name, post_date, post_status, post_author, post_content
     FROM ${p}posts
     WHERE post_type = 'post' AND post_status = 'publish'
     ORDER BY post_date DESC
     LIMIT ${POST_LIMIT}`
  );

  const rawPosts: RawPost[] = posts.map((r) => ({
    id: Number(r.ID),
    title: r.post_title || "(untitled)",
    slug: r.post_name || "",
    date: new Date(r.post_date as string).toISOString(),
    status: r.post_status,
    author_id: Number(r.post_author),
    content: r.post_content || "",
  }));

  const authorsRows = await query<{ ID: number; display_name: string }>(
    siteKey,
    `SELECT ID, display_name FROM ${p}users`
  );
  const authors = new Map<number, string>();
  authorsRows.forEach((a) => authors.set(Number(a.ID), a.display_name || "Unknown"));

  const catRows = await query<{ post_id: number; category: string }>(
    siteKey,
    `SELECT tr.object_id AS post_id, t.name AS category
     FROM ${p}term_relationships tr
     JOIN ${p}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
     JOIN ${p}terms t ON tt.term_id = t.term_id
     WHERE tt.taxonomy = 'category'`
  );
  const categoriesByPost = new Map<number, string[]>();
  catRows.forEach((r) => {
    const list = categoriesByPost.get(Number(r.post_id)) ?? [];
    list.push(r.category);
    categoriesByPost.set(Number(r.post_id), list);
  });

  const kwRows = await query<{ post_id: number; meta_value: string }>(
    siteKey,
    `SELECT post_id, meta_value FROM ${p}postmeta
     WHERE meta_key IN ('rank_math_focus_keyword','_yoast_wpseo_focuskw','_aioseo_keywords','_keyword')
       AND meta_value IS NOT NULL AND meta_value <> ''`
  );
  const keywordByPost = new Map<number, string>();
  kwRows.forEach((r) => {
    if (!keywordByPost.has(Number(r.post_id))) {
      keywordByPost.set(Number(r.post_id), String(r.meta_value).split(",")[0].trim());
    }
  });

  const statusRows = await query<{ status: string; count: number }>(
    siteKey,
    `SELECT post_status AS status, COUNT(*) AS count
     FROM ${p}posts WHERE post_type='post' GROUP BY post_status`
  );
  const statusCounts = statusRows.map((r) => ({
    status: r.status,
    count: Number(r.count),
  }));

  const totalPosts = statusCounts.reduce((a, s) => a + s.count, 0);

  const commentRow = await query<{ count: number }>(
    siteKey,
    `SELECT COUNT(*) AS count FROM ${p}comments`
  );
  const totalComments = Number(commentRow[0]?.count ?? 0);

  return {
    posts: rawPosts,
    authors,
    categoriesByPost,
    keywordByPost,
    statusCounts,
    totalPosts,
    totalComments,
  };
}
