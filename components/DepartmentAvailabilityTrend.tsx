// components/DepartmentAvailabilityTrend.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export type AggregatedAvailabilityRow = {
  month: string; // "YYYY-MM"
  total_hours_available: number;
  total_hours_committed: number;
  total_hours_free: number;
};

type Props = {
  departmentName: string;
  data: AggregatedAvailabilityRow[]; // from get_aggregated_availability_for_department
};

function formatMonthLabel(m: string) {
  // m = "YYYY-MM" -> "MMM YYYY"
  const [y, mm] = m.split("-");
  const d = new Date(Number(y), Number(mm) - 1, 1);
  return d.toLocaleString(undefined, { month: "short", year: "numeric" });
}

export default function DepartmentAvailabilityTrend({
  departmentName,
  data,
}: Props) {
  const rows = Array.isArray(data) ? data : [];

  if (!rows.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability trend — {departmentName}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground bg-card rounded-b-xl">
          No availability data found for the upcoming months.
        </CardContent>
      </Card>
    );
  }

  // Totals across the window
  const totals = rows.reduce(
    (acc, r) => {
      acc.available += Number(r.total_hours_available || 0);
      acc.committed += Number(r.total_hours_committed || 0);
      acc.free += Number(r.total_hours_free || 0);
      return acc;
    },
    { available: 0, committed: 0, free: 0 }
  );

  const utilization = totals.available
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((totals.available - totals.free) / totals.available) * 100
          )
        )
      )
    : 0;

  // Build sparkline from % free per month
  const pctFreePerMonth = rows.map((r) => {
    const a = Number(r.total_hours_available || 0);
    const f = Number(r.total_hours_free || 0);
    return a > 0 ? Math.max(0, Math.min(100, (f / a) * 100)) : 0;
  });

  const width = 240;
  const height = 64;
  const paddingX = 8;
  const paddingY = 6;
  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const points =
    pctFreePerMonth.length === 1
      ? [
          [paddingX, paddingY + innerH * (1 - pctFreePerMonth[0] / 100)],
          [
            paddingX + innerW,
            paddingY + innerH * (1 - pctFreePerMonth[0] / 100),
          ],
        ]
      : pctFreePerMonth.map((val, i) => {
          const x = paddingX + (i / (pctFreePerMonth.length - 1)) * innerW;
          const y = paddingY + innerH * (1 - val / 100);
          return [x, y] as const;
        });

  const pathD =
    points.length > 1
      ? `M ${points[0][0]} ${points[0][1]} ` +
        points
          .slice(1)
          .map((p) => `L ${p[0]} ${p[1]}`)
          .join(" ")
      : "";

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Availability trend — {departmentName}</CardTitle>

        {/* Sparkline */}
        <div className="flex items-center gap-3">
          <svg width={width} height={height} className="rounded-md bg-muted">
            {/* baseline */}
            <line
              x1={paddingX}
              y1={paddingY + innerH}
              x2={paddingX + innerW}
              y2={paddingY + innerH}
              stroke="currentColor"
              className="text-muted-foreground/40"
              strokeWidth={1}
            />
            {/* path */}
            <path
              d={pathD}
              stroke="currentColor"
              className="text-primary"
              strokeWidth={2}
              fill="none"
            />
          </svg>
          <div className="text-xs text-muted-foreground hidden sm:block">
            % free / month
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Window utilization</span>
            <span className="font-medium">{utilization}%</span>
          </div>
          <Progress value={utilization} />
          <div className="mt-1 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              Available:{" "}
              <span className="font-medium text-foreground">
                {totals.available}
              </span>{" "}
              h
            </div>
            <div>
              Committed:{" "}
              <span className="font-medium text-foreground">
                {totals.committed}
              </span>{" "}
              h
            </div>
            <div>
              Free:{" "}
              <span className="font-medium text-foreground">{totals.free}</span>{" "}
              h
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-normal">Month</th>
                <th className="pb-2 pr-4 font-normal">Available (h)</th>
                <th className="pb-2 pr-4 font-normal">Committed (h)</th>
                <th className="pb-2 pr-4 font-normal">Free (h)</th>
                <th className="pb-2 pr-4 font-normal">Utilization</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const a = Number(r.total_hours_available || 0);
                const f = Number(r.total_hours_free || 0);
                const u = a
                  ? Math.max(0, Math.min(100, Math.round(((a - f) / a) * 100)))
                  : 0;

                return (
                  <tr key={r.month} className="border-t">
                    <td className="py-2 pr-4">{formatMonthLabel(r.month)}</td>
                    <td className="py-2 pr-4 tabular-nums">{a}</td>
                    <td className="py-2 pr-4 tabular-nums">
                      {Number(r.total_hours_committed || 0)}
                    </td>
                    <td className="py-2 pr-4 tabular-nums">{f}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-10 tabular-nums">{u}%</span>
                        <div className="flex-1">
                          <Progress value={u} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
