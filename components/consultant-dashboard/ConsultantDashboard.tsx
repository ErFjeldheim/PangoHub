"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  User,
  Calendar,
  Briefcase,
  Sparkles,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";

type AvailabilityItem = {
  month: string;
  hours_free: number;
  hours_available: number;
  hours_committed: number;
};

type ProjectItem = {
  id: string;
  name: string;
  client_name?: string | null;
  departments?: string[] | null;
  is_active?: boolean | null;
};

export function ConsultantDashboard({
  displayName,
  completenessPct,
  availability,
  myProjects,
  opportunities,
  primaryDepartmentName,
}: {
  displayName: string;
  completenessPct: number;
  availability: AvailabilityItem[];
  myProjects: ProjectItem[];
  opportunities: ProjectItem[];
  primaryDepartmentName?: string | null;
}) {
  const { t, language } = useLanguage();
  const pct = Math.round(completenessPct || 0);
  const activeProjects = (myProjects || []).filter((p) => p.is_active);

  // Format month display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1);
    return date.toLocaleDateString(language === "nb" ? "nb-NO" : "en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Calculate utilization percentage
  const getUtilization = (item: AvailabilityItem) => {
    if (item.hours_available === 0) return 0;
    return Math.round((item.hours_committed / item.hours_available) * 100);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          {t.dashboard.welcome.replace("{name}", displayName)}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t.dashboard.subtitle}
        </p>
      </header>

      {/* Profile completeness - Enhanced */}
      <Card className="relative overflow-hidden border-2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2.5">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-lg">
                  {t.dashboard.completeness}
                </div>
                <div className="text-sm text-muted-foreground">
                  {pct === 100
                    ? t.dashboard.complete
                    : t.dashboard.incomplete}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-3xl font-bold text-primary">{pct}%</div>
              {pct === 100 && (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Progress value={pct} className="h-2.5" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.dashboard.strength}</span>
              <span>{pct < 100 ? t.dashboard.remaining.replace("{pct}", String(100 - pct)) : "Complete"}</span>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto bg-transparent"
          >
            <Link href="/dashboard/profile">
              <User className="h-4 w-4 mr-2" />
              {t.dashboard.editProfile}
            </Link>
          </Button>
        </div>
      </Card>

      {/* Availability - Enhanced */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-full bg-blue-500/10 p-2">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-lg">{t.dashboard.availability}</div>
            <div className="text-sm text-muted-foreground">
              {t.dashboard.availabilitySubtitle}
            </div>
          </div>
        </div>

        {availability?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availability.map((a) => {
              const utilization = getUtilization(a);
              return (
                <div
                  key={a.month}
                  className="rounded-lg border bg-card p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{formatMonth(a.month)}</div>
                    <Badge
                      variant={utilization > 80 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {utilization}% {t.profile.availability.utilization.toLowerCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.profile.availability.available}</span>
                      <span className="font-medium">{a.hours_available}h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.profile.availability.committed}</span>
                      <span className="font-medium text-blue-600">
                        {a.hours_committed}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t.profile.availability.remaining}</span>
                      <span className="font-medium text-green-600">
                        {a.hours_free}h
                      </span>
                    </div>
                  </div>

                  <Progress value={utilization} className="h-1.5" />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground">
              {t.dashboard.noAvailability ?? "No availability set yet. Update your calendar to get matched with projects."}
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-t">
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto bg-transparent"
          >
            <Link href="/dashboard/profile#availability">
              <Calendar className="h-4 w-4 mr-2" />
              {t.dashboard.editProfile.replace("Profile", "Availability") || "Update Availability"}
            </Link>
          </Button>
        </div>
      </Card>

      {/* My active projects - Enhanced */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-full bg-purple-500/10 p-2">
            <Briefcase className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-lg">{t.dashboard.activeProjects}</div>
            <div className="text-sm text-muted-foreground">
              {t.dashboard.activeProjectsSubtitle
                .replace("{count}", String(activeProjects.length))
                .replace("{project}", activeProjects.length === 1 ? "project" : "projects")}
            </div>
          </div>
        </div>

        {activeProjects.length ? (
          <div className="grid gap-3">
            {activeProjects.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/projects/${p.id}`}
                className="group rounded-lg border bg-card p-4 hover:shadow-md hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-base group-hover:text-primary transition-colors">
                        {p.name}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {t.projects.status.active}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{p.client_name ?? "Internal"}</span>
                      {p.departments?.length ? (
                        <>
                          <span>•</span>
                          <span>{p.departments.join(", ")}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto">
              <Briefcase className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground">
              {t.dashboard.noActiveProjects}
            </div>
          </div>
        )}
      </Card>

      {/* Opportunities - Enhanced */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="rounded-full bg-amber-500/10 p-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold text-lg">
              {t.dashboard.opportunities}
            </div>
            <div className="text-sm text-muted-foreground">
              {t.dashboard.opportunitiesSubtitle}
            </div>
          </div>
        </div>

        {opportunities?.length ? (
          <div className="grid gap-3">
            {opportunities.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href={`/dashboard/projects/${o.id}`}
                className="group rounded-lg border bg-card p-4 hover:shadow-md hover:border-amber-500/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="font-medium text-base group-hover:text-amber-600 transition-colors">
                      {o.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {o.client_name ?? "Internal"}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto">
              <TrendingUp className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground">
              {t.dashboard.noOpportunities}
            </div>
          </div>
        )}
      </Card>

      {/* Department peek - Enhanced */}
      {primaryDepartmentName && (
        <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2.5">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="font-semibold text-lg">
                  {t.dashboard.department.replace("{name}", primaryDepartmentName)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t.dashboard.departmentSubtitle}
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/dashboard/consultants">
                  <Users className="h-4 w-4 mr-2" />
                  {t.dashboard.browseColleagues}
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
