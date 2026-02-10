"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/server-auth";
import type {
  ProjectStatus,
  ProjectOverview,
  ProjectDetail,
  DepartmentProject,
  DepartmentHour,
  ProjectUpdate as AppProjectUpdate,
  Applicant,
} from "@/types/project";
import type { Project, Client, ProjectSkill, ProjectMember, User, ProjectUpdate, ProjectDepartmentHour, ProjectInterest } from "@/types/pocketbase";

export async function isProjectMember(
  projectId: string,
  profileId: string
): Promise<boolean> {
  const pb = await createServerClient();
  try {
      await pb.collection("project_members").getFirstListItem(`project="${projectId}" && user="${profileId}"`);
      return true;
  } catch {
      return false;
  }
}

export async function hasAppliedToProject(
  projectId: string,
  profileId: string
): Promise<boolean> {
  const pb = await createServerClient();
  try {
      await pb.collection("project_interest").getFirstListItem(`project="${projectId}" && profile="${profileId}"`);
      return true;
  } catch {
      return false;
  }
}

export async function listProjects(params?: {
  status?: ProjectStatus | "all";
  department?: string;
  search?: string;
}) {
  const pb = await createServerClient();
  let filterParts: string[] = [];

  if (params?.status && params.status !== "all") {
      filterParts.push(`status="${params.status}"`);
  }

  if (params?.search) {
      filterParts.push(`(name~"${params.search}" || description~"${params.search}")`);
  }

  if (params?.department) {
      try {
          // Find dept ID
          const dept = await pb.collection("departments").getFirstListItem(`name="${params.department}"`);
          // Find projects with this department
          const pdh = await pb.collection("project_department_hours").getFullList({
              filter: `department="${dept.id}"`
          });
          const pIds = pdh.map(p => p.project);
          if (pIds.length === 0) return [];
          const idFilter = pIds.map(id => `id="${id}"`).join(" || ");
          filterParts.push(`(${idFilter})`);
      } catch {
          return [];
      }
  }

  const filter = filterParts.join(" && ");
  
  const projects = await pb.collection("projects").getFullList<Project>({
      filter,
      expand: 'client',
      sort: '-start_date'
  });

  return projects.map(p => ({
      ...mapToProjectOverview(p, (p.expand?.client as Client)?.name)
  }));
}

export async function getProjectDetail(
  projectId: string
): Promise<ProjectDetail | null> {
  const pb = await createServerClient();
  
  let project: Project;
  try {
      project = await pb.collection("projects").getOne<Project>(projectId, {
          expand: 'client'
      });
  } catch {
      return null;
  }

  // Skills
  const projectSkills = await pb.collection("project_skills").getFullList<ProjectSkill>({
      filter: `project="${projectId}"`,
      expand: 'skill'
  });
  const skills = projectSkills.map(ps => ({
      id: ps.expand?.skill?.id,
      name: ps.expand?.skill?.name
  })).filter(s => s.id && s.name) as { id: string; name: string }[];

  // Members
  const membersRecords = await pb.collection("project_members").getFullList<ProjectMember>({
      filter: `project="${projectId}"`,
      expand: 'user'
  });
  
  const members = membersRecords.map(m => {
      const u = m.expand?.user as User;
      if (!u) return null;
      return {
          profile_id: m.user,
          display_name: u.display_name || `${u.first_name} ${u.last_name}`,
          title: u.title || null,
          role: m.role || null,
          hours: m.hours || null,
          start_date: m.start_date || null,
          end_date: m.end_date || null,
          contribution: m.contribution || null
      };
  }).filter((m): m is ProjectDetail["members"][number] => m !== null);

  return {
      id: project.id,
      name: project.name,
      description: project.description || null,
      status: (project.status as ProjectStatus) || "active",
      start_date: project.start_date || null,
      end_date: project.end_date || null,
      client_name: (project.expand?.client as Client)?.name || null,
      skills,
      members
  };
}

export async function getProjectsForDepartment(
  departmentId: string
): Promise<DepartmentProject[]> {
  const pb = await createServerClient();
  
  // Find projects linked to department
  const pdh = await pb.collection("project_department_hours").getFullList<ProjectDepartmentHour>({
      filter: `department="${departmentId}"`,
      expand: 'project.client'
  });

  return pdh.map(item => {
      const p = item.expand?.project as Project;
      if (!p) return null;
      const client = (p.expand?.client as Client)?.name || null;
      
      return {
          id: p.id,
          name: p.name,
          description: p.description || null,
          start_date: p.start_date || null,
          end_date: p.end_date || null,
          status: (p.status as ProjectStatus) || "active",
          client_name: client
      }
  }).filter((p): p is DepartmentProject => p !== null);
}

// Mutations

export async function createProject(input: {
  name: string;
  description?: string;
  client_id?: string | null;
  status?: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
}) {
  await requireAdmin();
  const pb = await createServerClient();

  try {
      const record = await pb.collection("projects").create({
          name: input.name,
          description: input.description,
          client: input.client_id,
          status: input.status || "active",
          start_date: input.start_date,
          end_date: input.end_date
      });
      return record;
  } catch (e: any) {
      throw e;
  }
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
  const pb = await createServerClient();

  try {
      const record = await pb.collection("projects").update(projectId, {
          name: patch.name,
          description: patch.description,
          client: patch.client_id,
          status: patch.status,
          start_date: patch.start_date,
          end_date: patch.end_date
      });
      return record;
  } catch (e: any) {
      throw e;
  }
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
  const pb = await createServerClient();

  try {
      const record = await pb.collection("project_members").create({
          project: projectId,
          user: member.profile_id,
          role: member.role,
          hours: member.hours,
          start_date: member.start_date,
          end_date: member.end_date,
          contribution: member.contribution
      });
      return record;
  } catch (e: any) {
      throw e;
  }
}

export async function removeMember(projectId: string, profileId: string) {
  await requireAdmin();
  const pb = await createServerClient();

  try {
      const record = await pb.collection("project_members").getFirstListItem(`project="${projectId}" && user="${profileId}"`);
      await pb.collection("project_members").delete(record.id);
      return { ok: true };
  } catch (e: any) {
      throw e;
  }
}

export async function getActiveProjects() {
  const pb = await createServerClient();
  const projects = await pb.collection("projects").getFullList<Project>({
      filter: 'status="active"',
      sort: '-start_date',
      expand: 'client'
  });
  return projects.map(p => ({
      ...mapToProjectOverview(p, (p.expand?.client as Client)?.name)
  }));
}

function mapToProjectOverview(p: Project, clientName?: string): ProjectOverview {
    const start = p.start_date ? new Date(p.start_date) : null;
    const end = p.end_date ? new Date(p.end_date) : null;
    let duration = null;
    if (start && end) {
        duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
        id: p.id,
        name: p.name,
        description: p.description || null,
        status: (p.status as ProjectStatus) || "active",
        start_date: p.start_date || null,
        end_date: p.end_date || null,
        client_name: clientName || null,
        departments: [],
        is_active: p.status === 'active',
        consultant_count: 0,
        first_member_start: null,
        last_member_end: null,
        duration_days: duration
    }
}

// Extra Actions

export async function addRequiredSkill(projectId: string, skillId: string) {
  await requireAdmin();
  const pb = await createServerClient();
  await pb.collection("project_skills").create({
      project: projectId,
      skill: skillId
  });
  return { ok: true };
}

export async function removeRequiredSkill(projectId: string, skillId: string) {
  await requireAdmin();
  const pb = await createServerClient();
  const record = await pb.collection("project_skills").getFirstListItem(`project="${projectId}" && skill="${skillId}"`);
  await pb.collection("project_skills").delete(record.id);
  return { ok: true };
}

export async function setProjectHoursRequired(
  projectId: string,
  hours: number | null
) {
  await requireAdmin();
  const pb = await createServerClient();
  await pb.collection("projects").update(projectId, { hours_required: hours });
  return { ok: true };
}

export async function applyToProject(projectId: string, message?: string) {
  const pb = await createServerClient();
  const user = pb.authStore.record;
  if (!user) throw new Error("Not authenticated");

  // Upsert equivalent: check if exists
  try {
      const existing = await pb.collection("project_interest").getFirstListItem(`project="${projectId}" && profile="${user.id}"`);
      await pb.collection("project_interest").update(existing.id, { message });
  } catch {
      await pb.collection("project_interest").create({
          project: projectId,
          profile: user.id,
          message
      });
  }
  return { ok: true };
}

export async function withdrawApplication(projectId: string) {
  const pb = await createServerClient();
  const user = pb.authStore.record;
  if (!user) throw new Error("Not authenticated");

  const record = await pb.collection("project_interest").getFirstListItem(`project="${projectId}" && profile="${user.id}"`);
  await pb.collection("project_interest").delete(record.id);
  return { ok: true };
}

export async function listApplicants(projectId: string): Promise<Applicant[]> {
  await requireAdmin();
  const pb = await createServerClient();
  
  const records = await pb.collection("project_interest").getFullList<ProjectInterest>({
      filter: `project="${projectId}"`,
      expand: 'profile',
      sort: '-created'
  });

  return records.map(r => {
      const u = r.expand?.profile as User;
      return {
          profile_id: r.profile,
          display_name: u?.display_name || `${u?.first_name} ${u?.last_name}`,
          title: u?.title || null,
          message: r.message || null,
          created_at: r.created
      };
  });
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
  const pb = await createServerClient();

  // Create member
  await pb.collection("project_members").create({
      project: projectId,
      user: profileId,
      role,
      hours,
      start_date
  });

  // Delete interest
  try {
      const interest = await pb.collection("project_interest").getFirstListItem(`project="${projectId}" && profile="${profileId}"`);
      await pb.collection("project_interest").delete(interest.id);
  } catch {}

  return { ok: true };
}

// Files
// Assuming "project_files" collection
const PROJECT_FILES_COLLECTION = "project_files";

export async function listProjectFiles(projectId: string) {
  const pb = await createServerClient();
  try {
      const records = await pb.collection(PROJECT_FILES_COLLECTION).getFullList({
          filter: `project="${projectId}"`
      });
      return records.map(r => ({
          name: r.file, // Assuming 'file' field holds filename
          path: r.id, // ID for deletion
          publicUrl: pb.files.getUrl(r, r.file),
          created_at: r.created
      }));
  } catch {
      return [];
  }
}

export async function uploadProjectFile(projectId: string, file: File) {
  await requireAdmin();
  const pb = await createServerClient();
  await pb.collection(PROJECT_FILES_COLLECTION).create({
      project: projectId,
      file: file
  });
  return { ok: true };
}

export async function deleteProjectFile(projectId: string, fileId: string) {
  await requireAdmin();
  const pb = await createServerClient();
  await pb.collection(PROJECT_FILES_COLLECTION).delete(fileId);
  return { ok: true };
}

export async function listProjectDepartmentHours(projectId: string) {
  const pb = await createServerClient();
  const records = await pb.collection("project_department_hours").getFullList<ProjectDepartmentHour>({
      filter: `project="${projectId}"`,
      expand: 'department',
      sort: 'department.name'
  }); // Note: sort by expanded field might not work in some PB versions directly, but trying.

  return records.map(r => ({
      department_id: r.department,
      department_name: (r.expand?.department as any)?.name || "",
      hours_required: r.hours_required
  }));
}

export async function setProjectDepartmentHours(
  projectId: string,
  departmentId: string,
  hours: number
) {
  await requireAdmin();
  const pb = await createServerClient();
  
  try {
      const existing = await pb.collection("project_department_hours").getFirstListItem(`project="${projectId}" && department="${departmentId}"`);
      await pb.collection("project_department_hours").update(existing.id, { hours_required: hours });
  } catch {
      await pb.collection("project_department_hours").create({
          project: projectId,
          department: departmentId,
          hours_required: hours
      });
  }
  return { ok: true };
}

export async function removeProjectDepartmentHours(
  projectId: string,
  departmentId: string
) {
  await requireAdmin();
  const pb = await createServerClient();
  const record = await pb.collection("project_department_hours").getFirstListItem(`project="${projectId}" && department="${departmentId}"`);
  await pb.collection("project_department_hours").delete(record.id);
  return { ok: true };
}

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
  const pb = await createServerClient();
  const record = await pb.collection("project_members").getFirstListItem(`project="${projectId}" && user="${profileId}"`);
  await pb.collection("project_members").update(record.id, patch);
  return { ok: true };
}

// Form actions
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
  const path = formData.get("path") as string; // Using ID as path
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

async function isAdminUser(uid: string) {
  const pb = await createServerClient();
  const user = await pb.collection("users").getOne<User>(uid);
  return user.role === 'admin';
}

async function isProjectOwner(projectId: string, uid: string) {
  const pb = await createServerClient();
  const project = await pb.collection("projects").getOne<Project>(projectId);
  return project.owner === uid;
}

async function requireOwnerOrAdmin(projectId: string) {
  const pb = await createServerClient();
  const user = pb.authStore.record;
  if (!user) throw new Error("Not authenticated");

  if (await isAdminUser(user.id)) return;
  if (await isProjectOwner(projectId, user.id)) return;

  throw new Error("Forbidden");
}

export async function getProjectOwner(projectId: string): Promise<{
  profile_id: string;
  display_name: string | null;
} | null> {
  const pb = await createServerClient();
  try {
      const project = await pb.collection("projects").getOne<Project>(projectId, { expand: 'owner' });
      const owner = project.expand?.owner as User;
      if (!owner) return null;
      return {
          profile_id: owner.id,
          display_name: owner.display_name || `${owner.first_name} ${owner.last_name}`
      };
  } catch {
      return null;
  }
}

export async function setProjectOwner(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const ownerId = (formData.get("owner_profile_id") as string) || null;

  await requireAdmin();

  const pb = await createServerClient();

  if (ownerId) {
    try {
        await pb.collection("project_members").getFirstListItem(`project="${projectId}" && user="${ownerId}"`);
    } catch {
        throw new Error("Selected owner must be a current project member.");
    }
  }

  await pb.collection("projects").update(projectId, { owner: ownerId });
  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function listProjectUpdates(
  projectId: string
): Promise<AppProjectUpdate[]> {
  const pb = await createServerClient();
  try {
      const updates = await pb.collection("project_updates").getFullList<ProjectUpdate>({
          filter: `project="${projectId}"`,
          sort: '-created',
          expand: 'author'
      });
      return updates.map(u => ({
          id: u.id,
          title: u.title || null,
          body: u.body || null,
          created_at: u.created,
          author: u.expand?.author ? {
              id: (u.expand.author as User).id,
              display_name: (u.expand.author as User).display_name || null
          } : null
      }));
  } catch {
      return [];
  }
}

export async function createProjectUpdate(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const title = ((formData.get("title") as string) || "").trim() || null;
  const body = ((formData.get("body") as string) || "").trim() || null;

  await requireOwnerOrAdmin(projectId);

  const pb = await createServerClient();
  const user = pb.authStore.record;
  if (!user) throw new Error("Not authenticated");

  await pb.collection("project_updates").create({
      project: projectId,
      author: user.id,
      title,
      body
  });

  revalidatePath(`/dashboard/projects/${projectId}`);
}

export async function deleteProjectUpdate(formData: FormData) {
  const projectId = formData.get("project_id") as string;
  const updateId = formData.get("update_id") as string;

  await requireOwnerOrAdmin(projectId);

  const pb = await createServerClient();
  await pb.collection("project_updates").delete(updateId);

  revalidatePath(`/dashboard/projects/${projectId}`);
}
