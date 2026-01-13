// src/types/availability.ts

/** Postgres enum mirror — keep in sync with `availability_status` enum */
export const AVAILABILITY_STATUSES = [
  "available",
  "partly",
  "busy",
  "unavailable",
] as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

/** Raw row shape as stored in DB (a.k.a. your server action return) */
export type AvailabilityRow = {
  profile_id: string;
  month: string; // "YYYY-MM-01"
  hours_available: number;
  hours_committed: number;
  status: AvailabilityStatus; // computed in DB
  notes?: string | null;
};

/** UI-friendly shape expected by components */
export type Availability = {
  month: string; // "YYYY-MM-01"
  hours_available: number;
  hours_committed: number;
  hours_free: number; // derived = max(0, available - committed)
  status: AvailabilityStatus;
  notes?: string | null;
};

/** Type guard */
export function isAvailabilityStatus(v: unknown): v is AvailabilityStatus {
  return AVAILABILITY_STATUSES.includes(v as AvailabilityStatus);
}

/** Mapper: DB row -> component shape */
export function toAvailability(r: AvailabilityRow): Availability {
  const hours_available = Number(r.hours_available) || 0;
  const hours_committed = Number(r.hours_committed) || 0;
  return {
    month: r.month,
    hours_available,
    hours_committed,
    hours_free: Math.max(0, hours_available - hours_committed),
    status: r.status,
    notes: r.notes ?? null,
  };
}

/** Helper to create a zeroed month row (for gaps) */
export function emptyAvailability(
  profile_id: string,
  month: string
): AvailabilityRow {
  return {
    profile_id,
    month,
    hours_available: 0,
    hours_committed: 0,
    status: "unavailable",
    notes: null,
  };
}
