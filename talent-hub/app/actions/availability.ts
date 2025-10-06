"use server";

import { createClient } from "@/lib/supabase/server";
import { fmtMonth, nextNMonths } from "@/lib/date/availability";

/** Matches the Postgres enum availability_status */
export type AvailabilityStatus =
  | "available"
  | "partly"
  | "busy"
  | "unavailable";

export interface AvailabilityRow {
  profile_id: string;
  month: string; // "YYYY-MM-01"
  hours_available: number;
  hours_committed: number;
  status: AvailabilityStatus; // computed in DB
  notes?: string | null;
}

/** Fetches merged window for N months, filling missing months with defaults. */
export async function getAvailabilityForWindow(
  profileId: string,
  monthsAhead = 6
) {
  const supabase = await createClient();
  const months = nextNMonths(monthsAhead);
  const from = months[0];
  const to = months[months.length - 1];

  const { data, error } = await supabase
    .from("availability_months")
    .select("*")
    .eq("profile_id", profileId)
    .gte("month", from)
    .lte("month", to)
    .order("month", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch availability: ${error.message}`);
  }

  const byMonth = new Map<string, AvailabilityRow>(
    (data ?? []).map((r: any) => [r.month, r as AvailabilityRow])
  );

  const merged: AvailabilityRow[] = months.map((m) => {
    return (
      byMonth.get(m) ?? {
        profile_id: profileId,
        month: m,
        hours_available: 0,
        hours_committed: 0,
        status: "unavailable",
        notes: null,
      }
    );
  });

  return merged;
}

/** Convenience wrapper for the common 6-month view. */
export async function getAvailabilityNextSixMonths(profileId: string) {
  return getAvailabilityForWindow(profileId, 6);
}

/** Upserts hours for a single month and returns the saved row (with generated status). */
export async function upsertAvailabilityMonth(
  profileId: string,
  month: string, // "YYYY-MM-01"
  hoursAvailable: number
) {
  const supabase = await createClient();

  const safeHours = Math.max(0, Math.min(Number(hoursAvailable) || 0, 744));

  const { data, error } = await supabase
    .from("availability_months")
    .upsert(
      {
        profile_id: profileId,
        month,
        hours_available: safeHours,
      },
      // Must match PK order: (profile_id, month)
      { onConflict: "profile_id,month" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save availability: ${error.message}`);
  }

  return data as AvailabilityRow;
}

/** Optional: set/update notes for a month (kept separate from hours). */
export async function upsertAvailabilityNotes(
  profileId: string,
  month: string,
  notes: string | null
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("availability_months")
    .upsert(
      {
        profile_id: profileId,
        month,
        notes: notes ?? null,
      },
      { onConflict: "profile_id,month" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save notes: ${error.message}`);
  }

  return data as AvailabilityRow;
}

/**
 * Optional: adjust committed hours (e.g. from internal planning UI).
 * NOTE: In your schema, status is generated from (hours_available - hours_committed),
 * so this will automatically recompute status in the DB.
 */
export async function setCommittedHours(
  profileId: string,
  month: string,
  hoursCommitted: number
) {
  const supabase = await createClient();
  const safeCommitted = Math.max(0, Math.min(Number(hoursCommitted) || 0, 744));

  const { data, error } = await supabase
    .from("availability_months")
    .upsert(
      {
        profile_id: profileId,
        month,
        hours_committed: safeCommitted,
      },
      { onConflict: "profile_id,month" }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update committed hours: ${error.message}`);
  }

  return data as AvailabilityRow;
}

export async function getAggregatedAvailabilityForDepartment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_aggregated_availability_for_department", { p_department_id: id });
  if (error) {
    console.error("Error fetching aggregated availability:", error);
    return [];
  }
  return data;
}
