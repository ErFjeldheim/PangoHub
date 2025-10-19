"use client";

import { useMemo, useOptimistic, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import type {
  AvailabilityRow,
  AvailabilityStatus,
} from "@/app/actions/availability";
import { useFormStatus } from "react-dom";

function getStatusColor(status: AvailabilityStatus) {
  switch (status) {
    case "available":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
    case "partly":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
    case "busy":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
    case "unavailable":
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
  }
}

function getStatusIcon(status: AvailabilityStatus) {
  switch (status) {
    case "available":
      return <CheckCircle2 className="w-4 h-4" />;
    case "partly":
      return <AlertCircle className="w-4 h-4" />;
    case "busy":
      return <XCircle className="w-4 h-4" />;
    case "unavailable":
    default:
      return <Clock className="w-4 h-4" />;
  }
}

function formatStatus(status: AvailabilityStatus) {
  switch (status) {
    case "available":
      return "Available";
    case "partly":
      return "Partly Available";
    case "busy":
      return "Fully Committed";
    case "unavailable":
      return "Unavailable";
  }
}

function SavingButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md hover:shadow-lg transition-all duration-200"
      size="lg"
    >
      {pending ? (
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
  );
}

export function AvailabilityManagerClient({
  profileId,
  initial,
  saveHoursAction,
  saveNotesAction,
}: {
  profileId: string;
  initial: AvailabilityRow[];
  saveHoursAction: (fd: FormData) => Promise<void>;
  saveNotesAction: (fd: FormData) => Promise<void>;
}) {
  // optimistic local editing of hours_available
  const [optimisticRows, updateOptimistic] = useOptimistic(
    initial,
    (
      state: AvailabilityRow[],
      change: { month: string; hours_available: number }
    ) =>
      state.map((r) =>
        r.month === change.month
          ? { ...r, hours_available: change.hours_available }
          : r
      )
  );

  const [localHours, setLocalHours] = useState<Record<string, number>>(
    Object.fromEntries(initial.map((r) => [r.month, r.hours_available ?? 0]))
  );

  const totals = useMemo(() => {
    const totalAvailable = optimisticRows.reduce(
      (sum, r) => sum + (r.hours_available || 0),
      0
    );
    const totalCommitted = optimisticRows.reduce(
      (sum, r) => sum + (r.hours_committed || 0),
      0
    );
    return {
      totalAvailable,
      totalCommitted,
      remaining: totalAvailable - totalCommitted,
    };
  }, [optimisticRows]);

  const onChangeHours = (month: string, v: string) => {
    const num = Math.max(0, Math.min(Number(v || 0), 744));
    setLocalHours((prev) => ({ ...prev, [month]: num }));
    updateOptimistic({ month, hours_available: num });
  };

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
                {totals.totalAvailable}h
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
                {totals.totalCommitted}h
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
                {totals.remaining}h
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6">
          {optimisticRows.map((entry) => {
            const remaining = Math.max(
              0,
              (localHours[entry.month] ?? entry.hours_available ?? 0) -
                (entry.hours_committed ?? 0)
            );
            const pretty = new Date(entry.month).toLocaleString("default", {
              month: "long",
              year: "numeric",
            });
            const utilization =
              (localHours[entry.month] ?? entry.hours_available) > 0
                ? ((entry.hours_committed || 0) /
                    (localHours[entry.month] ?? entry.hours_available)) *
                  100
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
                            {localHours[entry.month] ??
                              (entry.hours_available || 0)}
                            h
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
                      {(localHours[entry.month] ?? entry.hours_available) >
                        0 && (
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-accent to-accent/80 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Input and Save */}
                    <div className="flex items-end gap-4">
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
                          value={
                            localHours[entry.month] ??
                            entry.hours_available ??
                            0
                          }
                          onChange={(e) =>
                            onChangeHours(entry.month, e.target.value)
                          }
                          onFocus={(e) => e.target.select()}
                        />
                      </div>

                      {/* Server Action form */}
                      <form
                        action={async (fd) => {
                          try {
                            await saveHoursAction(fd);
                            toast.success(
                              `Availability for ${pretty} saved successfully`
                            );
                          } catch (e: any) {
                            toast.error("Failed to save availability");
                          }
                        }}
                      >
                        <input
                          type="hidden"
                          name="profile_id"
                          value={profileId}
                        />
                        <input type="hidden" name="month" value={entry.month} />
                        <input
                          type="hidden"
                          name="hours_available"
                          value={String(
                            localHours[entry.month] ??
                              entry.hours_available ??
                              0
                          )}
                        />
                        <SavingButton />
                      </form>
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
