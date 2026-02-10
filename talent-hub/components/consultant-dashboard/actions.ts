"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import {
  getCurrentUser,
  getCurrentProfile,
  isAdmin,
} from "@/lib/auth/server-auth";
import { getAvailabilityForWindow } from "@/app/actions/availability";
import { getActiveProjects } from "@/app/actions/projects";
import type { ProjectMember, Project, Client, ProfileDepartment } from "@/types/pocketbase";

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

function normalizeProjectRow(p: any): ProjectItem | null {
  const id = p.id ?? null;
  if (!id) return null;
  return {
    id,
    name: p.name ?? "",
    client_name: p.client_name ?? "",
    departments: Array.isArray(p.departments) ? p.departments : [],
    is_active: p.is_active || false,
  };
}

function toAvailabilityItems(
  rows: Array<{
    month: string;
    hours_available?: number | null;
    hours_committed?: number | null;
  }>
): AvailabilityItem[] {
  return rows
    .map((r) => {
        const available = Number(r.hours_available ?? 0);
        const committed = Number(r.hours_committed ?? 0);
        return {
            month: r.month,
            hours_free: Math.max(0, available - committed),
            hours_available: available,
            hours_committed: committed,
        }
    })
    .filter((r) => r.month);
}

export async function getConsultantHomeData() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [admin, profile] = await Promise.all([
    isAdmin(user.id),
    getCurrentProfile(),
  ]);

  const pb = await createServerClient();

  const completenessPct = 50; 

  const availabilityRows = await getAvailabilityForWindow(user.id, 6);
  const availability: AvailabilityItem[] = toAvailabilityItems(availabilityRows);

  const myMemberRows = await pb.collection("project_members").getFullList<ProjectMember>({
      filter: `user="${user.id}"`
  });

  const myIds: string[] = myMemberRows.map(r => r.project);

  let myProjectsRaw: any[] = [];
  if (myIds.length > 0) {
      const filter = myIds.map(id => `id="${id}"`).join(" || ");
      const projects = await pb.collection("projects").getFullList<Project>({
          filter,
          expand: 'client'
      });
      myProjectsRaw = projects.map(p => ({
          id: p.id,
          name: p.name,
          client_name: (p.expand?.client as Client)?.name,
          is_active: p.status === 'active'
      }));
  }

  const myProjects: ProjectItem[] = myProjectsRaw
    .map((p) => normalizeProjectRow(p))
    .filter((p): p is ProjectItem => p !== null);

  const activeRaw = await getActiveProjects();
  const activeProjects: ProjectItem[] = activeRaw
    .map((p) => normalizeProjectRow(p))
    .filter((p): p is ProjectItem => p !== null);

  const myIdSet = new Set(myIds);
  const opportunities: ProjectItem[] = activeProjects.filter(
    (p) => !myIdSet.has(p.id)
  );

  let primaryDepartmentName: string | null = null;
  try {
      const dept = await pb.collection("profile_departments").getFirstListItem<ProfileDepartment>(`user="${user.id}" && is_primary=true`, {
          expand: 'department'
      });
      if (dept.expand?.department) {
          primaryDepartmentName = dept.expand.department.name;
      }
  } catch {}

  const displayName =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "there";

  return {
    isAdmin: !!admin,
    displayName,
    primaryDepartmentName,
    completenessPct,
    availability,
    myProjects,
    opportunities,
  };
}
