import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Users, TrendingUp, Clock } from "lucide-react";

export default async function AnalyticsPage() {
  await requireAdmin();
  const supabase = await createClient();

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
