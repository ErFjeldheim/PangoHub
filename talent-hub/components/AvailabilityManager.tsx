"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Save,
  TrendingUp,
} from "lucide-react";
import {
  getAvailabilityNextSixMonths,
  upsertAvailabilityMonth,
  type AvailabilityRow,
  AvailabilityStatus,
} from "@/app/actions/availability";

interface AvailabilityManagerProps {
  profileId: string;
}

const fmtMonth = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
};

const nextNMonths = (n: number) => {
  const out: string[] = [];
  const base = new Date();
  base.setDate(1);
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setMonth(base.getMonth() + i);
    out.push(fmtMonth(d));
  }
  return out;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
    case "partially_available":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
    case "unavailable":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "available":
      return <CheckCircle2 className="w-4 h-4" />;
    case "partially_available":
      return <AlertCircle className="w-4 h-4" />;
    case "unavailable":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case "available":
      return "Available";
    case "partially_available":
      return "Partially Available";
    case "unavailable":
      return "Unavailable";
    default:
      return "Not Set";
  }
};

export function AvailabilityManager({ profileId }: AvailabilityManagerProps) {
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingMonth, setSavingMonth] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const months = useMemo(() => nextNMonths(6), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const rows = await getAvailabilityNextSixMonths(profileId);
        if (!cancelled) setAvailability(rows);
      } catch (err: Error | unknown) {
        console.error(err);
        toast.error("Failed to fetch availability");
        if (!cancelled) {
          // fill with client fallback if server fails
          const fallback = months.map((m) => ({
            profile_id: profileId,
            month: m,
            hours_available: 0,
            hours_committed: 0,
            status: "unavailable" as AvailabilityStatus,
            notes: null,
          }));
          setAvailability(fallback);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, months]);

  const handleHoursChange = (month: string, hours: string) => {
    const v = Math.max(0, Number(hours || 0));
    setAvailability((prev) =>
      prev.map((a) => (a.month === month ? { ...a, hours_available: v } : a))
    );
  };

  const handleSave = (month: string) => {
    const entry = availability.find((a) => a.month === month);
    if (!entry) return;

    setSavingMonth(month);
    startTransition(async () => {
      try {
        const saved = await upsertAvailabilityMonth(
          profileId,
          entry.month,
          entry.hours_available
        );
        // Patch just this month with the row returned by DB (includes generated status)
        setAvailability((prev) =>
          prev.map((a) => (a.month === month ? saved : a))
        );
        const pretty = new Date(month).toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        toast.success(`Availability for ${pretty} saved successfully`);
      } catch (err: Error | unknown) {
        console.error(err);
        toast.error(`Failed to save availability for ${month}`);
      } finally {
        setSavingMonth(null);
      }
    });
  };

  const totalAvailable = availability.reduce(
    (sum, entry) => sum + (entry.hours_available || 0),
    0
  );
  const totalCommitted = availability.reduce(
    (sum, entry) => sum + (entry.hours_committed || 0),
    0
  );

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-accent" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-balance">
              Monthly Availability Manager
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Set your work hours for the upcoming months
            </p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                Total Available
              </p>
              <p className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                {totalAvailable}h
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                Committed
              </p>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                {totalCommitted}h
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-400">
                Remaining
              </p>
              <p className="text-lg font-bold text-purple-900 dark:text-purple-300">
                {totalAvailable - totalCommitted}h
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6">
          {availability.map((entry) => {
            const remaining = Math.max(
              0,
              (entry.hours_available ?? 0) - (entry.hours_committed ?? 0)
            );
            const pretty = new Date(entry.month).toLocaleString("default", {
              month: "long",
              year: "numeric",
            });
            const isSaving = savingMonth === entry.month || isPending;
            const utilization =
              entry.hours_available > 0
                ? (entry.hours_committed / entry.hours_available) * 100
                : 0;

            return (
              <Card
                key={entry.month}
                className="border-2 hover:border-accent/30 transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Month Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Label className="text-lg font-semibold">
                          {pretty}
                        </Label>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            entry.status
                          )} flex items-center gap-1.5`}
                        >
                          {getStatusIcon(entry.status)}
                          {formatStatus(entry.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-semibold">
                            {entry.hours_available || 0}h
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Committed</p>
                          <p className="font-semibold">
                            {entry.hours_committed || 0}h
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Remaining</p>
                          <p className="font-semibold text-emerald-600">
                            {remaining}h
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Utilization</p>
                          <p className="font-semibold">
                            {utilization.toFixed(0)}%
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {entry.hours_available > 0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-accent to-accent/80 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Input and Save */}
                    <div className="flex items-center gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor={`hours-${entry.month}`}
                          className="text-sm font-medium"
                        >
                          Hours Available
                        </Label>
                        <Input
                          id={`hours-${entry.month}`}
                          type="number"
                          className="w-32 text-center font-semibold"
                          min={0}
                          max={744}
                          placeholder="0"
                          value={entry.hours_available ?? 0}
                          onChange={(e) =>
                            handleHoursChange(entry.month, e.target.value)
                          }
                          onFocus={(e) => e.target.select()}
                        />
                      </div>
                      <Button
                        onClick={() => handleSave(entry.month)}
                        disabled={isSaving}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200"
                        size="lg"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
