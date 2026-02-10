"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { nextNMonthsUTC } from "@/lib/date/availability";
import { revalidatePath } from "next/cache";
import { requireSelf } from "@/lib/auth/server-auth";
import type { AvailabilityMonth } from "@/types/pocketbase";
import {
  type AvailabilityRow,
  type Availability,
  toAvailability,
  emptyAvailability,
  isAvailabilityStatus,
} from "@/types/availability";

function clampHours(n: unknown, max = 744): number {
  const v = Number(n);
  if (!Number.isFinite(v) || v < 0) return 0;
  return Math.min(v, max);
}

function mapToAvailabilityRow(r: AvailabilityMonth): AvailabilityRow {
    return {
        profile_id: r.user,
        month: r.month,
        hours_available: r.hours_available,
        hours_committed: r.hours_committed || 0,
        status: (isAvailabilityStatus(r.status) ? r.status : "unavailable") as any,
        notes: r.notes || null,
    };
}

export async function getAvailabilityForWindow(
  profileId: string,
  monthsAhead = 6
): Promise<AvailabilityRow[]> {
  const pb = await createServerClient();
  const months = nextNMonthsUTC(monthsAhead);
  const from = months[0];
  const to = months[months.length - 1];

  let records: AvailabilityMonth[] = [];
  try {
      records = await pb.collection("availability_months").getFullList<AvailabilityMonth>({
          filter: `user="${profileId}" && month>="${from}" && month<="${to}"`,
          sort: 'month'
      });
  } catch (e) {
      console.error("fetch availability error:", e);
  }

  const byMonth = new Map<string, AvailabilityRow>(
    records.map((r) => [r.month, mapToAvailabilityRow(r)])
  );

  return months.map((m) => byMonth.get(m) ?? emptyAvailability(profileId, m));
}

export async function getAvailabilityNextSixMonths(profileId: string) {
  return getAvailabilityForWindow(profileId, 6);
}

export async function getConsultantCurrentAvailability(
  profileId: string
): Promise<Availability | null> {
  const rows = await getAvailabilityForWindow(profileId, 1);
  const r = rows[0];
  return r ? toAvailability(r) : null;
}

export async function getAggregatedAvailabilityForDepartment(id: string) {
    const pb = await createServerClient();
    
    let userIds: string[] = [];
    try {
        const deptProfiles = await pb.collection('profile_departments').getFullList({
            filter: `department="${id}"`
        });
        userIds = deptProfiles.map(dp => dp.user);
    } catch {
        return [];
    }
    
    if (userIds.length === 0) return [];

    let availability: AvailabilityMonth[] = [];
    try {
        const userFilter = userIds.map(uid => `user="${uid}"`).join(" || ");
        const currentMonth = new Date().toISOString().substring(0, 7);
        availability = await pb.collection('availability_months').getFullList<AvailabilityMonth>({
            filter: `(${userFilter}) && month >= "${currentMonth}"`
        });
    } catch {
        return [];
    }

    const aggMap = new Map<string, { total_hours_available: number; total_hours_committed: number; total_hours_free: number }>();
    
    for (const row of availability) {
        const entry = aggMap.get(row.month) || { total_hours_available: 0, total_hours_committed: 0, total_hours_free: 0 };
        entry.total_hours_available += row.hours_available;
        entry.total_hours_committed += (row.hours_committed || 0);
        entry.total_hours_free = entry.total_hours_available - entry.total_hours_committed;
        aggMap.set(row.month, entry);
    }

    return Array.from(aggMap.entries()).map(([month, stats]) => ({
        month,
        ...stats
    })).sort((a, b) => a.month.localeCompare(b.month));
}

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
  const pb = await createServerClient();

  let recordId: string | null = null;
  try {
      const existing = await pb.collection('availability_months').getFirstListItem(`user="${profileId}" && month="${month}"`);
      recordId = existing.id;
  } catch {}

  let record: AvailabilityMonth;
  try {
      if (recordId) {
          record = await pb.collection('availability_months').update<AvailabilityMonth>(recordId, {
              hours_available: hours,
              notes
          });
      } else {
          record = await pb.collection('availability_months').create<AvailabilityMonth>({
              user: profileId,
              month,
              hours_available: hours,
              notes
          });
      }
  } catch (e: any) {
      throw new Error(`Failed to save: ${e.message}`);
  }

  const mapped = mapToAvailabilityRow(record);
  revalidatePath(opts?.revalidate ?? "/dashboard/profile");
  return mapped;
}

export async function upsertAvailabilityMonthAction(formData: FormData) {
  if (!formData.get("hours_available")) formData.set("hours_available", "0");
  await upsertAvailabilityMonthAndNotesAction(formData);
}

export async function upsertAvailabilityNotesAction(formData: FormData) {
  if (!formData.get("hours_available")) formData.set("hours_available", "0");
  await upsertAvailabilityMonthAndNotesAction(formData);
}

export async function upsertAvailabilityMonth(
  profileId: string,
  month: string,
  hoursAvailable: number
): Promise<AvailabilityRow> {
  await requireSelf(profileId);
  const pb = await createServerClient();
  const hours = clampHours(hoursAvailable);

  let recordId: string | null = null;
  try {
      const existing = await pb.collection('availability_months').getFirstListItem(`user="${profileId}" && month="${month}"`);
      recordId = existing.id;
  } catch {}

  let record: AvailabilityMonth;
  try {
      if (recordId) {
          record = await pb.collection('availability_months').update<AvailabilityMonth>(recordId, {
              hours_available: hours
          });
      } else {
          record = await pb.collection('availability_months').create<AvailabilityMonth>({
              user: profileId,
              month,
              hours_available: hours
          });
      }
  } catch (e: any) {
      throw new Error(`Failed to save availability: ${e.message}`);
  }

  return mapToAvailabilityRow(record);
}

export async function setCommittedHours(
  profileId: string,
  month: string,
  hoursCommitted: number
): Promise<AvailabilityRow> {
  await requireSelf(profileId);
  const pb = await createServerClient();
  const safeCommitted = clampHours(hoursCommitted);

  let recordId: string | null = null;
  try {
      const existing = await pb.collection('availability_months').getFirstListItem(`user="${profileId}" && month="${month}"`);
      recordId = existing.id;
  } catch {}

  let record: AvailabilityMonth;
  try {
      if (recordId) {
          record = await pb.collection('availability_months').update<AvailabilityMonth>(recordId, {
              hours_committed: safeCommitted
          });
      } else {
          record = await pb.collection('availability_months').create<AvailabilityMonth>({
              user: profileId,
              month,
              hours_available: 0,
              hours_committed: safeCommitted
          });
      }
  } catch (e: any) {
      throw new Error(`Failed to save committed hours: ${e.message}`);
  }

  return mapToAvailabilityRow(record);
}
