// app/actions/consultantHome.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentUser,
  getCurrentProfile,
  isAdmin,
} from "@/lib/auth/server-auth";
import { getAvailabilityForWindow } from "@/app/actions/availability";
import { getActiveProjects } from "@/app/actions/projects";
import type { Database } from "@/types/supabase";

// ---- What ConsultantDashboard expects ----
type AvailabilityItem = {
  month: string;
  hours_free: number;
  hours_available: number;
  hours_committed: number;
};

type ProjectItem = {
  id: string;
  name: string;
  client_name?: string;
  departments: string[];
  is_active: boolean;
};

// ---- DB type aliases (from codegen) ----
type VProfileCompletenessRow =
  Database["public"]["Views"]["v_profile_completeness"]["Row"];

type VProfilesWithDeptRow =
  Database["public"]["Views"]["v_profiles_with_department"]["Row"];

type VProjectOverviewRow =
  Database["public"]["Views"]["v_project_overview"]["Row"];

// We only need a minimal subset for the dashboard tiles:
type VProjectOverviewMinimal = Pick<
  VProjectOverviewRow,
  "id" | "name" | "client_name" | "departments" | "is_active"
> &
  Partial<VProjectOverviewRow>;

// Normalize a project overview row (full or minimal) -> ProjectItem
function normalizeProjectRow(p: VProjectOverviewMinimal): ProjectItem | null {
  const id = p.id ?? null;
  if (!id) return null;
  return {
    id,
    name: p.name ?? "",
    client_name: p.client_name ?? "",
    departments: Array.isArray(p.departments) ? p.departments : [],
    is_active: Boolean(p.is_active),
  };
}

// Map AvailabilityRow[] -> AvailabilityItem[]
function toAvailabilityItems(
  rows: Array<{
    month: string;
    hours_free?: number | null;
    hours_available?: number | null;
    hours_committed?: number | null;
  }>
): AvailabilityItem[] {
  return rows
    .map((r) => ({
      month: r.month,
      hours_free: Number(r.hours_free ?? 0),
      hours_available: Number(r.hours_available ?? 0),
      hours_committed: Number(r.hours_committed ?? 0),
    }))
    .filter((r) => r.month);
}

export async function getConsultantHomeData() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [admin, profile] = await Promise.all([
    isAdmin(user.id),
    getCurrentProfile(),
  ]);

  const supabase = await createClient();

  // Completeness
  const { data: completenessRow } = await supabase
    .from("v_profile_completeness")
    .select("completeness_percentage")
    .eq("id", user.id)
    .maybeSingle<VProfileCompletenessRow>();

  // Availability (already merged by your availability action)
  const availabilityRows = await getAvailabilityForWindow(user.id, 6);
  const availability: AvailabilityItem[] =
    toAvailabilityItems(availabilityRows);

  // My project IDs — DO NOT put a generic on .select; just map the minimal shape
  const { data: myMemberRows } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("profile_id", user.id);

  const myIds: string[] = (myMemberRows ?? [])
    .map((r: { project_id: string | null }) => r.project_id)
    .filter((id): id is string => !!id);

  // My projects — to avoid param mismatch, just select "*" (view is cheap)
  const { data: myProjectsRaw } = myIds.length
    ? await supabase.from("v_project_overview").select("*").in("id", myIds)
    : { data: [] as VProjectOverviewRow[] };

  const myProjects: ProjectItem[] = (myProjectsRaw ?? [])
    .map((p) => normalizeProjectRow(p))
    .filter((p): p is ProjectItem => p !== null);

  // Opportunities = active projects not in myIds
  // If getActiveProjects() returns full rows, the normalizer still handles it.
  const activeRaw = await getActiveProjects();
  const activeProjects: ProjectItem[] = (activeRaw as VProjectOverviewMinimal[])
    .map((p) => normalizeProjectRow(p))
    .filter((p): p is ProjectItem => p !== null);

  const myIdSet = new Set(myIds);
  const opportunities: ProjectItem[] = activeProjects.filter(
    (p) => !myIdSet.has(p.id)
  );

  // Primary department name (CurrentProfile doesn't include it)
  const { data: deptRow } = await supabase
    .from("v_profiles_with_department")
    .select("primary_department")
    .eq("id", user.id)
    .maybeSingle<VProfilesWithDeptRow>();

  const displayName =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "there";

  return {
    isAdmin: !!admin,
    displayName,
    primaryDepartmentName: deptRow?.primary_department ?? null,
    completenessPct: Number(completenessRow?.completeness_percentage ?? 0),
    availability, // AvailabilityItem[]
    myProjects, // ProjectItem[]
    opportunities, // ProjectItem[]
  };
}
