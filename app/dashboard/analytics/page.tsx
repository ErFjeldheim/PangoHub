import { requireAdmin } from "@/lib/auth/server-auth";

export default async function AnalyticsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights into your consultant network
        </p>
      </div>

      <h1>In development</h1>
    </div>
  );
}
