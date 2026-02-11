// components/DepartmentsInformation.tsx
import Link from "next/link";
import { Users, User, CalendarCheck } from "lucide-react";
import {
  getDepartmentsOverview,
  type DepartmentOverview,
} from "@/app/actions/departments";
import clsx from "clsx";

export default async function DepartmentsInformation() {
  const departments: DepartmentOverview[] = await getDepartmentsOverview();
  console.log(departments);

  if (!departments?.length) {
    return (
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
        </div>
        <div className="rounded-xl border p-6 text-sm text-muted-foreground bg-card shadow-sm">
          No departments to show yet.
        </div>
      </section>
    );
  }

  // Sort: lowest availability first (surface bottlenecks)
  const sorted = [...departments].sort((a, b) => {
    const ra = a.totalConsultants
      ? a.availableConsultants / a.totalConsultants
      : 0;
    const rb = b.totalConsultants
      ? b.availableConsultants / b.totalConsultants
      : 0;
    return ra - rb;
  });

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Departments</h2>
        <p className="text-sm text-muted-foreground">
          Click a card to see full details.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((d) => {
          const ratio = d.totalConsultants
            ? d.availableConsultants / d.totalConsultants
            : 0;
          const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));

          const chipClass = clsx(
            "text-xs rounded-full px-2 py-1",
            d.totalConsultants === 0
              ? "bg-muted text-muted-foreground"
              : ratio >= 0.8
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : ratio >= 0.3
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          );

          const barClass = clsx(
            "h-2 rounded-full transition-all",
            d.totalConsultants === 0
              ? "bg-muted"
              : ratio >= 0.8
              ? "bg-green-500"
              : ratio >= 0.3
              ? "bg-amber-500"
              : "bg-red-500"
          );

          return (
            <Link
              key={d.id}
              href={`/dashboard/departments/${d.id}`}
              className="group rounded-2xl border bg-card p-5 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="truncate text-lg font-semibold">{d.name}</h3>
                <span className={chipClass}>
                  {d.availableConsultants}/{d.totalConsultants} available
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>
                    Leader:{" "}
                    <span className="text-foreground">
                      {d.leaderName || "Unassigned"}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    Consultants:{" "}
                    <span className="text-foreground">
                      {d.totalConsultants}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarCheck className="h-4 w-4" />
                  <span>
                    Available now:{" "}
                    <span className="text-foreground">
                      {d.availableConsultants}
                    </span>
                  </span>
                </div>
              </div>

              {/* Availability bar */}
              <div className="mt-4" aria-label="availability">
                <div className="h-2 w-full rounded-full bg-muted">
                  <div className={barClass} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {pct}% available
                </p>
              </div>

              <div className="mt-4 text-right text-xs text-primary opacity-0 transition group-hover:opacity-100">
                View details →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
