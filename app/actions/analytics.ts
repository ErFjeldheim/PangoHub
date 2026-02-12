"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { requireAdmin } from "@/lib/auth/server-auth";
import type { AvailabilityMonth } from "@/types/pocketbase";

export type AnalyticsStats = {
  totalConsultants: number;
  availableNow: number;
  utilizationRate: number;
  statusDistribution: { name: string; value: number; color: string }[];
  departmentDistribution: { name: string; value: number }[];
  utilizationTrend: { month: string; utilization: number }[];
};

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  await requireAdmin();
  const pb = await createServerClient();

  // 1. Fetch all users (consultants)
  const users = await pb.collection("users").getFullList({
    sort: "-id",
  });
  const totalConsultants = users.length;

  // 2. Fetch current month availability
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentAvailability = await pb.collection("availability_months").getFullList<AvailabilityMonth>({
    filter: `month="${currentMonth}"`,
  });

  // Calculate Status Distribution & Available Now
  let availableCount = 0;
  let busyCount = 0;
  let partlyCount = 0;
  let unavailableCount = 0;
  
  // Create a map for quick lookup
  const userStatusMap = new Map<string, string>();
  
  currentAvailability.forEach(r => {
    // If status is explicit, use it. Otherwise infer.
    let status = r.status as string | undefined;
    if (!status) {
        if (r.hours_available <= 0) status = "unavailable";
        else if ((r.hours_committed || 0) >= r.hours_available) status = "busy";
        else if ((r.hours_committed || 0) > 0) status = "partial";
        else status = "available";
    }
    userStatusMap.set(r.user, status);
  });

  // Iterate users to ensure we count those without records as "unknown" or "unavailable"
  let unknownCount = 0;

  users.forEach(u => {
      const status = userStatusMap.get(u.id);
      if (!status) {
          unknownCount++;
      } else {
          if (status === 'available') availableCount++;
          else if (status === 'busy') busyCount++;
          else if (status === 'partial' || status === 'partly') partlyCount++;
          else if (status === 'unavailable') unavailableCount++;
      }
  });

  const availableNow = availableCount;

  // Calculate Utilization Rate (Committed / Available for current month)
  // Only consider records that exist
  let totalHoursAvailable = 0;
  let totalHoursCommitted = 0;
  currentAvailability.forEach(r => {
      totalHoursAvailable += r.hours_available || 0;
      totalHoursCommitted += r.hours_committed || 0;
  });
  const utilizationRate = totalHoursAvailable > 0 
    ? Math.round((totalHoursCommitted / totalHoursAvailable) * 100) 
    : 0;

  // 3. Department Distribution
  // We need to fetch profile_departments
  const profileDepts = await pb.collection("profile_departments").getFullList({
      expand: 'department',
  });
  
  const deptCountMap = new Map<string, number>();
  profileDepts.forEach(pd => {
      const deptName = pd.expand?.department?.name || "Unknown";
      deptCountMap.set(deptName, (deptCountMap.get(deptName) || 0) + 1);
  });
  
  const departmentDistribution = Array.from(deptCountMap.entries()).map(([name, value]) => ({
      name,
      value
  })).sort((a, b) => b.value - a.value);

  // 4. Utilization Trend (Last 6 months)
  // We can fetch aggregated stats.
  // Let's implement a simple version: fetch all availability for last 6 months.
  // Actually, `getAvailabilityForWindow` does per user. We want aggregate.
  
  // Calculate date range
  const today = new Date();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(d.toISOString().substring(0, 7));
  }
  const startMonth = months[0];
  const endMonth = months[months.length - 1];

  const trendRecords = await pb.collection("availability_months").getFullList<AvailabilityMonth>({
      filter: `month >= "${startMonth}" && month <= "${endMonth}"`,
      sort: 'month'
  });

  const trendMap = new Map<string, { available: number; committed: number }>();
  months.forEach(m => trendMap.set(m, { available: 0, committed: 0 }));

  trendRecords.forEach(r => {
      const entry = trendMap.get(r.month);
      if (entry) {
          entry.available += r.hours_available || 0;
          entry.committed += r.hours_committed || 0;
      }
  });

  const utilizationTrend = months.map(month => {
      const data = trendMap.get(month);
      const rate = data && data.available > 0 ? Math.round((data.committed / data.available) * 100) : 0;
      return { month, utilization: rate };
  });

  return {
    totalConsultants,
    availableNow,
    utilizationRate,
    statusDistribution: [
        { name: "Available", value: availableCount, color: "#10b981" },
        { name: "Partly", value: partlyCount, color: "#f59e0b" },
        { name: "Busy", value: busyCount, color: "#f97316" },
        { name: "Unavailable", value: unavailableCount, color: "#ef4444" },
    ].filter(i => i.value > 0),
    departmentDistribution,
    utilizationTrend
  };
}
