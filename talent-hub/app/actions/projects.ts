// app/actions/projects.ts
"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";

/* -----------------------------------------------------------------------------
   Helpers
----------------------------------------------------------------------------- */

async function getServerClient(): Promise<SupabaseClient> {
  // Your server client is async, always await it.
  return await createServerSupabaseClient();
}

async function requireAdmin(): Promise<void> {
  const supabase = await getServerClient();

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Not authenticated");

  // DB-side source of truth for admins
  const { data: isAdmin, error } = await supabase.rpc("is_admin", {
    uid: user.id,
  });
  if (error) throw error;
  if (!isAdmin) throw new Error("Forbidden");
}

/* -----------------------------------------------------------------------------
   Types
----------------------------------------------------------------------------- */

export type ProjectStatus = "planned" | "active" | "completed" | "on_hold";

export type ProjectOverview = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  client_name: string | null;
  consultant_count: number;
  departments: string[] | null;
  first_member_start: string | null;
  last_member_end: string | null;
  is_active: boolean;
  duration_days: number | null;
};

export type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  client_name: string | null;
  skills: { id: string; name: string }[];
  members: Array<{
    profile_id: string;
    display_name: string;
    title: string | null;
    role: string | null;
    hours: number | null;
    start_date: string | null;
    end_date: string | null;
    contribution: string | null;
  }>;
};

/* -----------------------------------------------------------------------------
   Reads (open to any signed-in user)
----------------------------------------------------------------------------- */

export async function listProjects(params?: {
  status?: ProjectStatus | "all";
  department?: string; // department name filter (matches array column)
  search?: string; // naive ilike on name/description (MVP)
}) {
  const supabase = await getServerClient();

  let query = supabase
    .from("v_project_overview")
    .select("*")
    .order("is_active", { ascending: false })
    .order("start_date", { ascending: false });

  if (params?.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params?.department) {
    // departments is a text[] array in the view
    query = query.contains("departments", [params.department]);
  }
  if (params?.search) {
    query = query.or(
      `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
    );
  }

  const { data, error } = await query.returns<ProjectOverview[]>();
  if (error) throw error;
  return data ?? [];
}

export async function getProjectDetail(
  projectId: string
): Promise<ProjectDetail | null> {
  const supabase = await getServerClient();

  // Header/basic fields from the view
  const { data: header, error: hErr } = await supabase
    .from("v_project_overview")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (hErr) throw hErr;
  if (!header) return null;

  // Skills joined via project_skills → skills
  const { data: skillsRows, error: sErr } = await supabase
    .from("project_skills")
    .select("skills:skills(id,name)")
    .eq("project_id", projectId);
  if (sErr) throw sErr;

  // Members with profile display info
  const { data: membersRows, error: mErr } = await supabase
    .from("project_members")
    .select(
      `
      profile_id,
      role,
      hours,
      start_date,
      end_date,
      contribution,
      profiles!inner(display_name, title)
    `
    )
    .eq("project_id", projectId);
  if (mErr) throw mErr;

  return {
    id: header.id,
    name: header.name,
    description: header.description,
    status: header.status as ProjectStatus,
    start_date: header.start_date,
    end_date: header.end_date,
    client_name: header.client_name,
    skills: (skillsRows ?? []).map((row: any) => row.skills).filter(Boolean),
    members: (membersRows ?? []).map((row: any) => ({
      profile_id: row.profile_id,
      display_name: row.profiles.display_name,
      title: row.profiles.title,
      role: row.role,
      hours: row.hours,
      start_date: row.start_date,
      end_date: row.end_date,
      contribution: row.contribution,
    })),
  };
}

/**
 * Department-scoped list using your existing SQL function:
 * get_projects_for_department(p_department_id uuid)
 */
export type DepartmentProject = {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "planned" | "active" | "completed" | "on_hold";
  client_name: string | null;
};

export async function getProjectsForDepartment(
  departmentId: string
): Promise<DepartmentProject[]> {
  const supabase = await getServerClient();

  // 1) Base list from your RPC (id, name, description, dates)
  const { data: base, error: rpcErr } = await supabase.rpc(
    "get_projects_for_department",
    { p_department_id: departmentId }
  );
  if (rpcErr) throw rpcErr;
  const ids = (base ?? []).map((r: any) => r.id);
  if (!ids.length) return [];

  // 2) Enrich with status + client name via projects ← clients
  const { data: enriched, error: joinErr } = await supabase
    .from("projects")
    .select("id, status, clients:client_id(name)")
    .in("id", ids);
  if (joinErr) throw joinErr;

  const statusById = new Map<
    string,
    { status: DepartmentProject["status"]; client_name: string | null }
  >(
    (enriched ?? []).map((r: any) => [
      r.id,
      { status: r.status, client_name: r.clients?.name ?? null },
    ])
  );

  return (base ?? []).map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    start_date: r.start_date,
    end_date: r.end_date,
    status: statusById.get(r.id)?.status ?? "active",
    client_name: statusById.get(r.id)?.client_name ?? null,
  }));
}

/* -----------------------------------------------------------------------------
   Admin-only mutations (guarded with requireAdmin)
----------------------------------------------------------------------------- */

export async function createProject(input: {
  name: string;
  description?: string;
  client_id?: string | null;
  status?: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
}) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      description: input.description ?? null,
      client_id: input.client_id ?? null,
      status: input.status ?? "active",
      start_date: input.start_date ?? null,
      end_date: input.end_date ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(
  projectId: string,
  patch: Partial<{
    name: string;
    description: string | null;
    client_id: string | null;
    status: ProjectStatus;
    start_date: string | null;
    end_date: string | null;
  }>
) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function addMember(
  projectId: string,
  member: {
    profile_id: string;
    role?: string | null;
    hours?: number | null;
    start_date?: string | null;
    end_date?: string | null;
    contribution?: string | null;
  }
) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      profile_id: member.profile_id,
      role: member.role ?? null,
      hours: member.hours ?? null,
      start_date: member.start_date ?? null,
      end_date: member.end_date ?? null,
      contribution: member.contribution ?? null,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function removeMember(projectId: string, profileId: string) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { error } = await supabase
    .from("project_members")
    .delete()
    .match({ project_id: projectId, profile_id: profileId });

  if (error) throw error;
  return { ok: true };
}

export async function getActiveProjects() {
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("v_project_overview")
    .select("*")
    .eq("status", "active")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ---- EXTRA ACTIONS FOR DASHBOARD PROJECT PAGE ----

import { randomUUID } from "crypto";

// Skill management
export async function addRequiredSkill(projectId: string, skillId: string) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { error } = await supabase
    .from("project_skills")
    .insert({ project_id: projectId, skill_id: skillId });
  if (error) throw error;

  return { ok: true };
}

export async function removeRequiredSkill(projectId: string, skillId: string) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { error } = await supabase
    .from("project_skills")
    .delete()
    .match({ project_id: projectId, skill_id: skillId });
  if (error) throw error;

  return { ok: true };
}

// Hours required (project-level integer column)
export async function setProjectHoursRequired(
  projectId: string,
  hours: number | null
) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { error } = await supabase
    .from("projects")
    .update({ hours_required: hours })
    .eq("id", projectId);
  if (error) throw error;

  return { ok: true };
}

// Applications (consultant expresses interest)
export async function applyToProject(projectId: string, message?: string) {
  const supabase = await getServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Not authenticated");

  const { error } = await supabase.from("project_interest").upsert({
    project_id: projectId,
    profile_id: user.id,
    message: message ?? null,
  });
  if (error) throw error;

  return { ok: true };
}

export async function withdrawApplication(projectId: string) {
  const supabase = await getServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("project_interest")
    .delete()
    .match({ project_id: projectId, profile_id: user.id });
  if (error) throw error;

  return { ok: true };
}

export async function listApplicants(projectId: string) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { data, error } = await supabase
    .from("project_interest")
    .select(
      `
      profile_id,
      message,
      created_at,
      profiles!inner(display_name, title)
    `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    profile_id: r.profile_id,
    display_name: r.profiles.display_name,
    title: r.profiles.title,
    message: r.message,
    created_at: r.created_at,
  }));
}

export async function approveApplicant({
  projectId,
  profileId,
  role,
  hours,
  start_date,
}: {
  projectId: string;
  profileId: string;
  role: string;
  hours?: number | null;
  start_date?: string | null;
}) {
  await requireAdmin();
  const supabase = await getServerClient();

  // Build payload carefully to avoid overwriting with nulls
  const payload: Record<string, any> = {
    project_id: projectId,
    profile_id: profileId,
    role,
  };
  if (hours !== undefined && hours !== null) payload.hours = hours;
  if (start_date) payload.start_date = start_date;

  // Upsert on (project_id, profile_id)
  const { error: upsertErr } = await supabase
    .from("project_members")
    .upsert(payload, { onConflict: "project_id,profile_id" }); // prevent duplicate key error
  if (upsertErr) throw upsertErr;

  // Remove interest if it exists
  await supabase
    .from("project_interest")
    .delete()
    .match({ project_id: projectId, profile_id: profileId });

  return { ok: true };
}

// Storage: upload/delete/list files for projects
const PROJECT_BUCKET = "projects"; // create this bucket in Supabase Storage (public or RLS as you prefer)

export async function listProjectFiles(projectId: string) {
  const supabase = await getServerClient();

  const { data, error } = await supabase.storage
    .from(PROJECT_BUCKET)
    .list(`projects/${projectId}`);
  if (error) throw error;

  // return public URLs if bucket is public
  const files = (data ?? []).map((f) => ({
    name: f.name,
    path: `projects/${projectId}/${f.name}`,
    // comment the next two lines if using private bucket + signed URLs instead
    publicUrl: supabase.storage
      .from(PROJECT_BUCKET)
      .getPublicUrl(`projects/${projectId}/${f.name}`).data.publicUrl,
    created_at: (f as any).created_at ?? null,
  }));
  return files;
}

export async function uploadProjectFile(projectId: string, file: File) {
  await requireAdmin();
  const supabase = await getServerClient();

  const ext = file.name.split(".").pop();
  const key = `projects/${projectId}/${randomUUID()}.${ext ?? "bin"}`;

  const { error } = await supabase.storage
    .from(PROJECT_BUCKET)
    .upload(key, file, { upsert: false });
  if (error) throw error;

  return { ok: true };
}

export async function deleteProjectFile(projectId: string, path: string) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { error } = await supabase.storage.from(PROJECT_BUCKET).remove([path]);
  if (error) throw error;

  return { ok: true };
}

// -------- Department-hours (per project) --------

export type DepartmentHour = {
  department_id: string;
  department_name: string;
  hours_required: number;
};

export async function listProjectDepartmentHours(projectId: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("project_department_hours")
    .select("department_id, hours_required, departments!inner(name)")
    .eq("project_id", projectId)
    .order("departments(name)", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((r: any) => ({
    department_id: r.department_id,
    department_name: r.departments.name,
    hours_required: r.hours_required,
  })) as DepartmentHour[];
}

/**
 * Admin: set/replace hours for a department on a project (upsert)
 */
export async function setProjectDepartmentHours(
  projectId: string,
  departmentId: string,
  hours: number
) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { error } = await supabase.from("project_department_hours").upsert(
    {
      project_id: projectId,
      department_id: departmentId,
      hours_required: hours,
    },
    { onConflict: "project_id,department_id" }
  );
  if (error) throw error;

  return { ok: true };
}

/**
 * Admin: remove a department hours row from a project
 */
export async function removeProjectDepartmentHours(
  projectId: string,
  departmentId: string
) {
  await requireAdmin();
  const supabase = await getServerClient();

  const { error } = await supabase
    .from("project_department_hours")
    .delete()
    .match({ project_id: projectId, department_id: departmentId });
  if (error) throw error;

  return { ok: true };
}
