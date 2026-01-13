// app/actions/availability.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { nextNMonthsUTC } from "@/lib/date/availability";
import { revalidatePath } from "next/cache";
import { requireSelf } from "@/lib/auth/server-auth";
import type { Database } from "@/types/supabase";

import {
  type AvailabilityRow,
  type Availability,
  toAvailability,
  emptyAvailability,
  isAvailabilityStatus,
} from "@/types/availability";

// -------------------------------
// DB type aliases (from codegen)
// -------------------------------
type AvailabilityMonthsRow =
  Database["public"]["Tables"]["availability_months"]["Row"];
type AvailabilityMonthsInsert =
  Database["public"]["Tables"]["availability_months"]["Insert"];

type DeptAggArgs =
  Database["public"]["Functions"]["get_aggregated_availability_for_department"]["Args"];
type DeptAggReturn =
  Database["public"]["Functions"]["get_aggregated_availability_for_department"]["Returns"];

// -------------------------------
// mappers & utils
// -------------------------------
function clampHours(n: unknown, max = 744): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.min(v, max);
}

function mapDbRowToAvailabilityRow(r: AvailabilityMonthsRow): AvailabilityRow {
  const hours_available = Number(r.hours_available ?? 0);
  const hours_committed = Number(r.hours_committed ?? 0);

  // status may be null/text from DB; coerce safely
  const statusRaw = (r as { status?: unknown })?.status ?? null;
  const status = isAvailabilityStatus(statusRaw) ? statusRaw : "unavailable";

  return {
    profile_id: r.profile_id as string, // codegen sometimes makes these nullable on views; table row should be string
    month: r.month as string,
    hours_available,
    hours_committed,
    status,
    notes: r.notes ?? null,
  };
}

// -------------------------------
// queries
// -------------------------------
/** Fetches merged window for N months, filling missing months with defaults. */
export async function getAvailabilityForWindow(
  profileId: string,
  monthsAhead = 6
): Promise<AvailabilityRow[]> {
  const supabase = await createClient();
  const months = nextNMonthsUTC(monthsAhead);
  const from = months[0];
  const to = months[months.length - 1];

  const { data, error } = await supabase
    .from("availability_months")
    .select("*")
    .eq("profile_id", profileId)
    .gte("month", from)
    .lte("month", to)
    .order("month", { ascending: true });

  if (error) throw new Error(`Failed to fetch availability: ${error.message}`);

  const rows = (data ?? []) as AvailabilityMonthsRow[];
  const byMonth = new Map<string, AvailabilityRow>(
    rows.map((r) => {
      const mapped = mapDbRowToAvailabilityRow(r);
      return [mapped.month, mapped];
    })
  );

  return months.map((m) => byMonth.get(m) ?? emptyAvailability(profileId, m));
}

export async function getAvailabilityNextSixMonths(profileId: string) {
  return getAvailabilityForWindow(profileId, 6);
}

/** Returns exactly the UI shape for the *current* month. */
export async function getConsultantCurrentAvailability(
  profileId: string
): Promise<Availability | null> {
  const rows = await getAvailabilityForWindow(profileId, 1);
  const r = rows[0];
  return r ? toAvailability(r) : null;
}

export async function getAggregatedAvailabilityForDepartment(id: string) {
  const supabase = await createClient();
  const args = { p_department_id: id } satisfies DeptAggArgs;

  const { data, error } = await supabase.rpc(
    "get_aggregated_availability_for_department",
    args
  );

  if (error) {
    console.error("Error fetching aggregated availability:", error);
    return [] as DeptAggReturn;
  }
  return (data ?? []) as DeptAggReturn;
}

// -------------------------------
// mutations
// -------------------------------
/** Combined server action: upsert hours *and* notes in one round trip. */
export async function upsertAvailabilityMonthAndNotesAction(
  formData: FormData,
  opts?: { revalidate?: string }
) {
  const profileId = String(formData.get("profile_id") ?? "");
  const month = String(formData.get("month") ?? "");
  const hours = clampHours(formData.get("hours_available"));
  const notes =
    typeof formData.get("notes") === "string"
      ? (formData.get("notes") as string)
      : null;

  await requireSelf(profileId);
  const supabase = await createClient();

  const payload = {
    profile_id: profileId,
    month,
    hours_available: hours,
    notes,
  } satisfies AvailabilityMonthsInsert;

  const { data, error } = await supabase
    .from("availability_months")
    .upsert(payload, { onConflict: "profile_id,month" })
    .select()
    .single();

  if (error) throw new Error(`Failed to save: ${error.message}`);

  const mapped = mapDbRowToAvailabilityRow(data as AvailabilityMonthsRow);
  revalidatePath(opts?.revalidate ?? "/dashboard/profile");
  return mapped;
}

/** Back-compat: hours-only form action (wraps combined). */
export async function upsertAvailabilityMonthAction(formData: FormData) {
  if (!formData.get("hours_available")) formData.set("hours_available", "0");
  await upsertAvailabilityMonthAndNotesAction(formData);
}

/** Back-compat: notes-only form action (wraps combined). */
export async function upsertAvailabilityNotesAction(formData: FormData) {
  if (!formData.get("hours_available")) formData.set("hours_available", "0");
  await upsertAvailabilityMonthAndNotesAction(formData);
}

/** Programmatic helper: set hours only (non-form). */
export async function upsertAvailabilityMonth(
  profileId: string,
  month: string, // "YYYY-MM-01"
  hoursAvailable: number
): Promise<AvailabilityRow> {
  await requireSelf(profileId);
  const supabase = await createClient();
  const hours = clampHours(hoursAvailable);

  const payload = {
    profile_id: profileId,
    month,
    hours_available: hours,
  } satisfies AvailabilityMonthsInsert;

  const { data, error } = await supabase
    .from("availability_months")
    .upsert(payload, { onConflict: "profile_id,month" })
    .select()
    .single();

  if (error) throw new Error(`Failed to save availability: ${error.message}`);
  return mapDbRowToAvailabilityRow(data as AvailabilityMonthsRow);
}

/** Programmatic helper: set committed hours (e.g., internal planning UI). */
export async function setCommittedHours(
  profileId: string,
  month: string,
  hoursCommitted: number
): Promise<AvailabilityRow> {
  await requireSelf(profileId);
  const supabase = await createClient();
  const safeCommitted = clampHours(hoursCommitted);

  // 1) Try update-only
  const { data: updated, error: updateErr } = await supabase
    .from("availability_months")
    .update({ hours_committed: safeCommitted })
    .eq("profile_id", profileId)
    .eq("month", month)
    .select()
    .maybeSingle();

  // If an actual error (not just "no rows"), bail
  if (updateErr && updateErr.code !== "PGRST116") {
    throw new Error(`Failed to update committed hours: ${updateErr.message}`);
  }

  if (updated) {
    return mapDbRowToAvailabilityRow(updated as AvailabilityMonthsRow);
  }

  // 2) Row didn't exist -> insert with a safe default for hours_available
  const insertPayload = {
    profile_id: profileId,
    month,
    hours_available: 0, // safe default for brand new month
    hours_committed: safeCommitted,
  } satisfies AvailabilityMonthsInsert;

  const { data: inserted, error: insertErr } = await supabase
    .from("availability_months")
    .insert(insertPayload)
    .select()
    .single();

  if (insertErr) {
    throw new Error(`Failed to insert committed hours: ${insertErr.message}`);
  }

  return mapDbRowToAvailabilityRow(inserted as AvailabilityMonthsRow);
}
