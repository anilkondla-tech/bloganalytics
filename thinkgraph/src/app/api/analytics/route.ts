import { getSiteAnalytics } from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const site = searchParams.get("site");
  const withAi = searchParams.get("ai") === "1";
  const fresh = searchParams.get("fresh") === "1";

  try {
    const data = await getSiteAnalytics(site, { withAi, fresh });
    return Response.json(data, {
      headers: { "Cache-Control": "s-maxage=600, stale-while-revalidate=1200" },
    });
  } catch (err) {
    return Response.json(
      { error: "analysis_failed", message: String(err) },
      { status: 500 }
    );
  }
}
