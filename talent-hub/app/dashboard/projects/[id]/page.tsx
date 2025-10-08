import {
  getProjectDetail,
  addRequiredSkill,
  removeRequiredSkill,
  applyToProject,
  withdrawApplication,
  listApplicants,
  approveApplicant,
  listProjectFiles,
  uploadProjectFile,
  deleteProjectFile,
  listProjectDepartmentHours,
  setProjectDepartmentHours,
  removeProjectDepartmentHours,
} from "@/app/actions/projects";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { DepartmentHoursTable } from "@/components/projects/department-hours-table";
import { RequiredSkills } from "@/components/projects/required-skills";
import { ApplicationForm } from "@/components/projects/application-form";
import { ApplicantsList } from "@/components/projects/applicants-list";
import { ProjectFiles } from "@/components/projects/project-files";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

const ROUTE_BASE = "/dashboard/projects";

const ROLE_OPTIONS = [
  "Consultant",
  "Lead Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full-stack Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "Product Designer",
  "UX Designer",
  "Data Scientist",
  "Data Engineer",
  "BI Analyst",
  "Project Manager",
  "Analyst",
];

const statusColors = {
  planned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  on_hold:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export default async function DashboardProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = params.id;
  const supabase = await createClient();

  // Who am I? Am I admin?
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id ?? null;
  let isAdmin = false;
  if (userId) {
    const { data } = await supabase.rpc("is_admin", { uid: userId });
    isAdmin = !!data;
  }

  // Project header & detail
  const project = await getProjectDetail(projectId);
  if (!project) return notFound();

  // All skills
  const { data: allSkills } = await supabase
    .from("skills")
    .select("id, name")
    .order("name", { ascending: true });

  // Department hours
  const deptHours = await listProjectDepartmentHours(projectId);

  // All departments for admin dropdown
  const { data: allDepartments } = await supabase
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true });

  // Applicants (admins only)
  const applicants = isAdmin ? await listApplicants(projectId) : [];

  // Files
  const files = await listProjectFiles(projectId);

  // Check if I have already applied
  let iApplied = false;
  if (userId) {
    const { data: myApp } = await supabase
      .from("project_interest")
      .select("project_id")
      .match({ project_id: projectId, profile_id: userId })
      .maybeSingle();
    iApplied = !!myApp;
  }

  /* ---------------- Server Actions (inline) ---------------- */

  async function addSkillAction(formData: FormData) {
    "use server";
    const pid = formData.get("project_id") as string;
    const skillId = formData.get("skill_id") as string;
    await addRequiredSkill(pid, skillId);
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  async function removeSkillAction(formData: FormData) {
    "use server";
    const pid = formData.get("project_id") as string;
    const skillId = formData.get("skill_id") as string;
    await removeRequiredSkill(pid, skillId);
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  async function upsertDeptHoursAction(formData: FormData) {
    "use server";
    const pid = formData.get("project_id") as string;
    const departmentId = formData.get("department_id") as string;
    const hoursStr = (formData.get("hours_required") as string) || "0";
    const hours = Math.max(0, Number.parseInt(hoursStr, 10) || 0);
    await setProjectDepartmentHours(pid, departmentId, hours);
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  async function removeDeptHoursAction(formData: FormData) {
    "use server";
    const pid = formData.get("project_id") as string;
    const departmentId = formData.get("department_id") as string;
    await removeProjectDepartmentHours(pid, departmentId);
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  async function applyAction(formData: FormData) {
    "use server";
    const pid = formData.get("project_id") as string;
    const msg = (formData.get("message") as string) || undefined;
    await applyToProject(pid, msg);
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  async function withdrawAction(formData: FormData) {
    "use server";
    const pid = formData.get("project_id") as string;
    await withdrawApplication(pid);
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  async function approveApplicantAction(formData: FormData) {
    "use server";
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
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  async function uploadFileAction(formData: FormData) {
    "use server";
    const pid = formData.get("project_id") as string;
    const file = formData.get("file") as File;
    if (!file || (file as any).size === 0) throw new Error("No file selected");
    await uploadProjectFile(pid, file);
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  async function deleteFileAction(formData: FormData) {
    "use server";
    const pid = formData.get("project_id") as string;
    const path = formData.get("path") as string;
    await deleteProjectFile(pid, path);
    revalidatePath(`${ROUTE_BASE}/${pid}`);
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <header className="space-y-4 pb-6 border-b">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge
              variant="secondary"
              className={`${
                statusColors[project.status as keyof typeof statusColors] || ""
              } text-sm px-3 py-1`}
            >
              {project.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {project.client_name && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>{project.client_name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>
                {project.start_date || "—"} → {project.end_date || "ongoing"}
              </span>
            </div>
          </div>

          {project.description && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {project.description}
            </p>
          )}
        </header>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            {userId && (
              <DepartmentHoursTable
                projectId={projectId}
                deptHours={deptHours}
                allDepartments={allDepartments}
                isAdmin={isAdmin}
                upsertAction={upsertDeptHoursAction}
                removeAction={removeDeptHoursAction}
              />
            )}

            <RequiredSkills
              projectId={projectId}
              skills={project.skills}
              allSkills={allSkills}
              isAdmin={isAdmin}
              addAction={addSkillAction}
              removeAction={removeSkillAction}
            />

            <ProjectFiles
              projectId={projectId}
              files={files}
              isAdmin={isAdmin}
              uploadAction={uploadFileAction}
              deleteAction={deleteFileAction}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ApplicationForm
              projectId={projectId}
              userId={userId}
              iApplied={iApplied}
              applyAction={applyAction}
              withdrawAction={withdrawAction}
            />

            {isAdmin && (
              <ApplicantsList
                projectId={projectId}
                applicants={applicants}
                roleOptions={ROLE_OPTIONS}
                approveAction={approveApplicantAction}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
