import { ping } from "@/lib/db";
import { resolveSiteKey } from "@/lib/data";
import { isDemoMode } from "@/lib/sites";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (isDemoMode()) {
    return Response.json({ status: "demo", connected: false });
  }
  const site = resolveSiteKey(searchParams.get("site"));
  const ok = await ping(site);
  return Response.json({ status: ok ? "ok" : "unreachable", connected: ok, site });
}
