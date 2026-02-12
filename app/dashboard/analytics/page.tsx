import { requireAdmin } from "@/lib/auth/server-auth";
import { getAnalyticsStats } from "@/app/actions/analytics";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage() {
  await requireAdmin();
  const stats = await getAnalyticsStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights into your consultant network
        </p>
      </div>

      <AnalyticsDashboard stats={stats} />
    </div>
  );
}
