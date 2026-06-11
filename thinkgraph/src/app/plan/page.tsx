import { getSiteAnalytics } from "@/lib/data";
import ActionList from "@/components/ActionList";
import { PageHeader, SourceBadge } from "@/components/ui";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export default async function PlanPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const site = typeof searchParams.site === "string" ? searchParams.site : undefined;
  // Try AI on first load so the plan is richest; falls back gracefully.
  const a = await getSiteAnalytics(site, { withAi: true });

  return (
    <div>
      <PageHeader
        title="Action Plan"
        subtitle="A prioritized, explainable backlog. Each item ties back to a concrete graph signal — accept the ones you'll ship."
        badge={<SourceBadge source={a.source} />}
      />
      <ActionList actions={a.actions} siteKey={a.site.key} aiEnabled={a.aiEnabled} />
    </div>
  );
}
