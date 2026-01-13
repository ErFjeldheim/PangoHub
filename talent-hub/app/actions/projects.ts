// app/actions/projects.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server-auth";
import { randomUUID } from "crypto";

// Shared app-wide types
import type {
  ProjectStatus,
  ProjectOverview,
  ProjectDetail,
  DepartmentProject,
  DepartmentHour,
  ProjectUpdate,
  Applicant,
} from "@/types/project";

/* -----------------------------------------------------------------------------
   Helpers
----------------------------------------------------------------------------- */

// Normalizes a PostgREST embed that might be object | object[] | null
function pickOne<T>(v: T | T[] | null | undefined): T | null {
  return Array.isArray(v) ? v[0] ?? null : v ?? null;
}

export async function isProjectMember(
  projectId: string,
  profileId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_members")
    .select("project_id")
    .match({ project_id: projectId, profile_id: profileId })
    .maybeSingle();
  if (error) return false; // or throw; your call
  return !!data;
}

export async function hasAppliedToProject(
  projectId: string,
  profileId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_interest")
    .select("project_id")
    .match({ project_id: projectId, profile_id: profileId })
    .maybeSingle();
  if (error) return false; // or throw
  return !!data;
}

/* -----------------------------------------------------------------------------
   Reads (open to any signed-in user)
----------------------------------------------------------------------------- */

export async function listProjects(params?: {
  status?: ProjectStatus | "all";
  department?: string; // department name filter (matches array column)
  search?: string; // naive ilike on name/description (MVP)
}) {
  const supabase = await createClient();

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
  const supabase = await createClient();

  // Header/basic fields from the view
  type HeaderRow = {
    id: string;
    name: string | null;
    description: string | null;
    status: ProjectStatus | string;
    start_date: string | null;
    end_date: string | null;
    client_name: string | null;
  };

  const { data: header, error: hErr } = await supabase
    .from("v_project_overview")
    .select("*")
    .eq("id", projectId)
    .maybeSingle<HeaderRow>(); // 👈 type the row we expect
  if (hErr) throw hErr;
  if (!header) return null;

  // Skills joined via project_skills → skills
  type SkillRow = { skills: { id: string; name: string } | null };

  const { data: skillsRows, error: sErr } = await supabase
    .from("project_skills")
    .select("skills(id,name)")
    .eq("project_id", projectId)
    .returns<SkillRow[]>(); // 👈 each row has a single "skills" object (or null)
  if (sErr) throw sErr;

  // Members: belongs-to embed might be object OR array in TS, normalize it
  type MemberRow = {
    profile_id: string;
    role: string | null;
    hours: number | null;
    start_date: string | null;
    end_date: string | null;
    contribution: string | null;
    profile:
      | { display_name: string; title: string | null }
      | { display_name: string; title: string | null }[]
      | null;
  };

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
      profile:profiles(display_name, title)
    `
    )
    .eq("project_id", projectId)
    .returns<MemberRow[]>();
  if (mErr) throw mErr;

  const members = (membersRows ?? [])
    .map((row) => {
      const prof = pickOne(row.profile);
      if (!prof) return null; // RLS might hide it
      return {
        profile_id: row.profile_id,
        display_name: prof.display_name,
        title: prof.title,
        role: row.role,
        hours: row.hours,
        start_date: row.start_date,
        end_date: row.end_date,
        contribution: row.contribution,
      };
    })
    .filter((v): v is ProjectDetail["members"][number] => v !== null);

  // Normalize nullables to match ProjectDetail
  return {
    id: header.id,
    name: header.name ?? "", // 👈 coerce to string
    description: header.description ?? null, // keep nullable
    status: header.status as ProjectStatus,
    start_date: header.start_date ?? null, // keep nullable
    end_date: header.end_date ?? null, // keep nullable
    client_name: header.client_name ?? null, // keep nullable
    skills: (skillsRows ?? []).flatMap((row) =>
      row.skills ? [row.skills] : []
    ), // 👈 flatten single-object rows safely
    members,
  };
}

/**
 * Department-scoped list using your existing SQL function:
 * get_projects_for_department(p_department_id uuid)
 */
export async function getProjectsForDepartment(
  departmentId: string
): Promise<DepartmentProject[]> {
  const supabase = await createClient();
  const { data: base, error: rpcErr } = await supabase.rpc(
    "get_projects_for_department",
    { p_department_id: departmentId }
  );
  if (rpcErr) throw rpcErr;

  type RpcProjectRow = {
    id: string;
    name: string;
    description: string | null;
    start_date: string | null;
    end_date: string | null;
  };

  const ids = (base ?? []).map((r: RpcProjectRow) => r.id);
  if (!ids.length) return [];

  type EnrichedRow = {
    id: string;
    status: ProjectStatus;
    client: { name: string } | { name: string }[] | null;
  };

  const { data: enriched, error: joinErr } = await supabase
    .from("projects")
    .select("id, status, client:client_id(name)")
    .in("id", ids)
    .overrideTypes<EnrichedRow[], { merge: false }>();
  if (joinErr) throw joinErr;

  const statusById = new Map(
    (enriched ?? []).map((r) => [
      r.id,
      { status: r.status, client_name: pickOne(r.client)?.name ?? null },
    ])
  );

  return (base ?? []).map((r: RpcProjectRow) => ({
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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

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
  const supabase = await createClient();

  const { error } = await supabase
    .from("project_members")
    .delete()
    .match({ project_id: projectId, profile_id: profileId });

  if (error) throw error;
  return { ok: true };
}

export async function getActiveProjects() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("v_project_overview")
    .select("*")
    .eq("status", "active")
    .order("start_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/* -----------------------------------------------------------------------------
   EXTRA ACTIONS FOR DASHBOARD PROJECT PAGE
----------------------------------------------------------------------------- */

// Skill management
export async function addRequiredSkill(projectId: string, skillId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("project_skills")
    .insert({ project_id: projectId, skill_id: skillId });
  if (error) throw error;

  return { ok: true };
}

export async function removeRequiredSkill(projectId: string, skillId: string) {
  await requireAdmin();
  const supabase = await createClient();

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
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({ hours_required: hours })
    .eq("id", projectId);
  if (error) throw error;

  return { ok: true };
}

// Applications (consultant expresses interest)
export async function applyToProject(projectId: string, message?: string) {
  const supabase = await createClient();
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
  const supabase = await createClient();
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

export async function listApplicants(projectId: string): Promise<Applicant[]> {
  await requireAdmin();
  const supabase = await createClient();

  type ApplicantRow = {
    profile_id: string;
    message: string | null;
    created_at: string;
    profile:
      | { display_name: string; title: string | null }
      | { display_name: string; title: string | null }[]
      | null;
  };

  const { data, error } = await supabase
    .from("project_interest")
    .select(
      `
        profile_id,
        message,
        created_at,
        profile:profiles(display_name, title)
      `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .overrideTypes<ApplicantRow[], { merge: false }>(); // <-- replace .returns
  if (error) throw error;

  return (data ?? [])
    .map((r) => {
      const prof = pickOne(r.profile);
      if (!prof) return null;
      return {
        profile_id: r.profile_id,
        display_name: prof.display_name,
        title: prof.title,
        message: r.message,
        created_at: r.created_at,
      };
    })
    .filter((v): v is Applicant => v !== null);
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
  const supabase = await createClient();

  // Build payload carefully to avoid overwriting with nulls
  const payload: {
    project_id: string;
    profile_id: string;
    role: string;
    hours?: number | null;
    start_date?: string | null;
  } = {
    project_id: projectId,
    profile_id: profileId,
    role,
  };
  if (hours !== undefined && hours !== null) payload.hours = hours;
  if (start_date) payload.start_date = start_date;

  // Upsert on (project_id, profile_id)
  const { error: upsertErr } = await supabase
    .from("project_members")
    .upsert(payload, { onConflict: "project_id,profile_id" });
  if (upsertErr) throw upsertErr;

  // Remove interest if it exists
  await supabase
    .from("project_interest")
    .delete()
    .match({ project_id: projectId, profile_id: profileId });

  return { ok: true };
}

// Storage: upload/delete/list files for projects
const PROJECT_BUCKET = "projects"; // create this bucket in Supabase Storage

export async function listProjectFiles(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(PROJECT_BUCKET)
    .list(`projects/${projectId}`);
  if (error) throw error;

  // return public URLs if bucket is public
  const files = (data ?? []).map((f) => ({
    name: f.name,
    path: `projects/${projectId}/${f.name}`,
    publicUrl: supabase.storage
      .from(PROJECT_BUCKET)
      .getPublicUrl(`projects/${projectId}/${f.name}`).data.publicUrl,
    created_at: (f as { created_at?: string }).created_at ?? null,
  }));
  return files;
}

export async function uploadProjectFile(projectId: string, file: File) {
  await requireAdmin();
  const supabase = await createClient();

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
  const supabase = await createClient();

  const { error } = await supabase.storage.from(PROJECT_BUCKET).remove([path]);
  if (error) throw error;

  return { ok: true };
}

/* -----------------------------------------------------------------------------
   Department-hours (per project)
----------------------------------------------------------------------------- */

export async function listProjectDepartmentHours(projectId: string) {
  const supabase = await createClient();

  type DeptHourRow = {
    department_id: string;
    hours_required: number;
    department: { name: string } | { name: string }[] | null;
  };

  const { data, error } = await supabase
    .from("project_department_hours")
    .select("department_id, hours_required, department:departments(name)")
    .eq("project_id", projectId)
    .order("department(name)", { ascending: true })
    .overrideTypes<DeptHourRow[], { merge: false }>(); // <-- replace .returns
  if (error) throw error;

  return (data ?? [])
    .map((r) => {
      const dept = pickOne(r.department);
      if (!dept) return null;
      return {
        department_id: r.department_id,
        department_name: dept.name,
        hours_required: r.hours_required,
      };
    })
    .filter((v): v is DepartmentHour => v !== null);
}

/** Admin: set/replace hours for a department on a project (upsert) */
export async function setProjectDepartmentHours(
  projectId: string,
  departmentId: string,
  hours: number
) {
  await requireAdmin();
  const supabase = await createClient();

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

/** Admin: remove a department hours row from a project */
export async function removeProjectDepartmentHours(
  projectId: string,
  departmentId: string
) {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("project_department_hours")
    .delete()
    .match({ project_id: projectId, department_id: departmentId });
  if (error) throw error;

  return { ok: true };
}

/* -----------------------------------------------------------------------------
   Member update/remove (used by <MembersList>)
----------------------------------------------------------------------------- */

export async function updateMember(
  projectId: string,
  profileId: string,
  patch: {
    role?: string | null;
    hours?: number | null;
    start_date?: string | null;
  }
) {
  await requireAdmin();
  const supabase = await createClient();

  const payload: {
    role?: string | null;
    hours?: number | null;
    start_date?: string | null;
  } = {};
  if (patch.role !== undefined) payload.role = patch.role;
  if (patch.hours !== undefined) payload.hours = patch.hours;
  if (patch.start_date !== undefined) payload.start_date = patch.start_date;

  const { error } = await supabase
    .from("project_members")
    .update(payload)
    .match({ project_id: projectId, profile_id: profileId });

  if (error) throw error;
  return { ok: true };
}

/* -----------------------------------------------------------------------------
   Form-action wrappers (used directly as <form action={...}>)
----------------------------------------------------------------------------- */

export async function addSkillAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const skillId = formData.get("skill_id") as string;
  await addRequiredSkill(pid, skillId);
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function removeSkillAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const skillId = formData.get("skill_id") as string;
  await removeRequiredSkill(pid, skillId);
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function upsertDeptHoursAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const departmentId = formData.get("department_id") as string;
  const hoursStr = (formData.get("hours_required") as string) || "0";
  const hours = Math.max(0, Number.parseInt(hoursStr, 10) || 0);
  await setProjectDepartmentHours(pid, departmentId, hours);
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function removeDeptHoursAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const departmentId = formData.get("department_id") as string;
  await removeProjectDepartmentHours(pid, departmentId);
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function applyAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const msg = (formData.get("message") as string) || undefined;
  await applyToProject(pid, msg);
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function withdrawAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  await withdrawApplication(pid);
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function approveApplicantAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const profileId = formData.get("profile_id") as string;
  const role = (formData.get("role") as string) || "Consultant";
  const hoursStr = (formData.get("hours") as string) || "";
  const start = (formData.get("start_date") as string) || null;
  const hours = hoursStr ? Number.parseInt(hoursStr, 10) : null;

  await approveApplicant({
    projectId: pid,
    profileId,
    role,
    hours,
    start_date: start,
  });
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function uploadFileAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const file = formData.get("file") as File;
  if (!file || file.size === 0) throw new Error("No file selected");
  await uploadProjectFile(pid, file);
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function deleteFileAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const path = formData.get("path") as string;
  await deleteProjectFile(pid, path);
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function updateMemberAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const profileId = formData.get("profile_id") as string;
  const role = ((formData.get("role") as string) || "").trim() || null;
  const hoursStr = (formData.get("hours") as string) || "";
  const hours = hoursStr ? Number.parseInt(hoursStr, 10) : null;
  const start = (formData.get("start_date") as string) || null;

  await updateMember(pid, profileId, { role, hours, start_date: start });
  revalidatePath(`/dashboard/projects/${pid}`);
}

export async function removeMemberAction(formData: FormData) {
  const pid = formData.get("project_id") as string;
  const profileId = formData.get("profile_id") as string;
  await removeMember(pid, profileId);
  revalidatePath(`/dashboard/projects/${pid}`);
}

/* -----------------------------------------------------------------------------
   Ownership helpers
----------------------------------------------------------------------------- */

async function isAdminUser(uid: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_admin", { uid });
  return !!data;
}

async function isProjectOwner(projectId: string, uid: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();
  return !!data?.owner_id && data.owner_id === uid;
}

/** Require owner or admin for owner-scope mutations (e.g., posting updates) */
async function requireOwnerOrAdmin(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  if (await isAdminUser(user.id)) return;
  if (await isProjectOwner(projectId, user.id)) return;

  throw new Error("Forbidden");
}

/* -----------------------------------------------------------------------------
   Project owner
----------------------------------------------------------------------------- */

/** Read: get current project owner (id + display_name) */
export async function getProjectOwner(projectId: string): Promise<{
  profile_id: string;
  display_name: string | null;
} | null> {
  const supabase = await createClient();

  const { data: proj, error: pErr } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!proj?.owner_id) return null;

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", proj.owner_id)
    .maybeSingle();
  if (profErr) throw profErr;
  if (!prof) return null;

  return { profile_id: prof.id, display_name: prof.display_name };
}

/** Form action (ADMIN ONLY): set/change owner. */
export async function setProjectOwner(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const ownerId = (formData.get("owner_profile_id") as string) || null;

  await requireAdmin(); // admin decides owner

  const supabase = await createClient();

  if (ownerId) {
    // ensure owner is a member of this project
    const { data: membership, error: mErr } = await supabase
      .from("project_members")
      .select("project_id")
      .match({ project_id: projectId, profile_id: ownerId })
      .maybeSingle();
    if (mErr) throw mErr;
    if (!membership) {
      throw new Error("Selected owner must be a current project member.");
    }
  }

  const { error: upErr } = await supabase
    .from("projects")
    .update({ owner_id: ownerId })
    .eq("id", projectId);
  if (upErr) throw upErr;

  revalidatePath(`/dashboard/projects/${projectId}`);
}

/* -----------------------------------------------------------------------------
   Project updates (status / goals / notes)
----------------------------------------------------------------------------- */

export async function listProjectUpdates(
  projectId: string
): Promise<ProjectUpdate[]> {
  const supabase = await createClient();

  type UpdateRow = {
    id: string;
    title: string | null;
    body: string | null;
    created_at: string;
    // belongs-to join -> single object (or null), not an array
    author: { id: string; display_name: string | null } | null;
  };

  const { data, error } = await supabase
    .from("project_updates")
    .select(
      `
        id,
        title,
        body,
        created_at,
        author:profiles!project_updates_author_id_fkey(id, display_name)
      `
    )
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .returns<UpdateRow[]>(); // <- ensure correct type

  if (error) throw error;

  return (data ?? []).map((u) => ({
    id: u.id,
    title: u.title,
    body: u.body,
    created_at: u.created_at,
    author: u.author
      ? { id: u.author.id, display_name: u.author.display_name }
      : null,
  }));
}

/** Create an update (Owner OR Admin). */
export async function createProjectUpdate(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const title = ((formData.get("title") as string) || "").trim() || null;
  const body = ((formData.get("body") as string) || "").trim() || null;

  await requireOwnerOrAdmin(projectId);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("project_updates").insert({
    project_id: projectId,
    author_id: user.id,
    title,
    body,
  });
  if (error) throw error;

  revalidatePath(`/dashboard/projects/${projectId}`);
}

/** Delete an update (Owner OR Admin). */
export async function deleteProjectUpdate(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const updateId = formData.get("update_id") as string;

  await requireOwnerOrAdmin(projectId);

  const supabase = await createClient();
  const { error } = await supabase
    .from("project_updates")
    .delete()
    .eq("id", updateId)
    .eq("project_id", projectId);
  if (error) throw error;

  revalidatePath(`/dashboard/projects/${projectId}`);
}
