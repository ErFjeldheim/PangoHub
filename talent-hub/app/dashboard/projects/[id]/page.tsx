// app/dashboard/projects/[id]/page.tsx
import {
  // reads
  getProjectDetail,
  listApplicants,
  listProjectDepartmentHours,
  listProjectFiles,
  getProjectOwner,
  listProjectUpdates,

  // form/server actions (centralized in actions/projects.ts)
  addSkillAction,
  removeSkillAction,
  upsertDeptHoursAction,
  removeDeptHoursAction,
  applyAction,
  withdrawAction,
  approveApplicantAction,
  uploadFileAction,
  deleteFileAction,
  updateMemberAction,
  removeMemberAction,
  setProjectOwner,
  createProjectUpdate,
  deleteProjectUpdate,
} from "@/app/actions/projects";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

import { DepartmentHoursTable } from "@/components/projects/department-hours-table";
import { RequiredSkills } from "@/components/projects/required-skills";
import { ApplicationForm } from "@/components/projects/application-form";
import { ApplicantsList } from "@/components/projects/applicants-list";
import { ProjectFiles } from "@/components/projects/project-files";
import { MembersList } from "@/components/projects/members-list";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { Building2, Calendar, Crown, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
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

  // Who am I? admin?
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

  // Project owner
  const owner = await getProjectOwner(projectId); // { profile_id, display_name } | null

  // Skills (for admin to add)
  const { data: allSkills } = await supabase
    .from("skills")
    .select("id, name")
    .order("name", { ascending: true });

  // Department hours configured on the project
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

  // Membership: am I already on this project?
  const isMember = !!project.members.find((m) => m.profile_id === userId);

  // I already applied?
  let iApplied = false;
  if (userId && !isMember) {
    const { data: myApp } = await supabase
      .from("project_interest")
      .select("project_id")
      .match({ project_id: projectId, profile_id: userId })
      .maybeSingle();
    iApplied = !!myApp;
  }

  // Project updates (status/goals/notes) — visible to all; postable by owner/admin
  const updates = await listProjectUpdates(projectId); // [{id,title,body,created_at,author:{id,display_name}}]

  const canApply =
    !!userId &&
    !isMember &&
    (project.status === "active" || project.status === "planned");

  const isOwner = !!(owner && owner.profile_id === userId);
  const canPostUpdate = isOwner || isAdmin;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <header className="space-y-4 pb-6 border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">
                {project.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {project.client_name && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {project.client_name}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {project.start_date || "—"} → {project.end_date || "ongoing"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {owner ? (
                <Badge variant="secondary" className="gap-1.5">
                  <Crown className="h-3.5 w-3.5" />
                  Owner: {owner.display_name}
                </Badge>
              ) : (
                <Badge variant="secondary">No owner set</Badge>
              )}
              <Badge
                variant="secondary"
                className={`${
                  statusColors[project.status as keyof typeof statusColors] ||
                  ""
                } text-sm px-3 py-1`}
              >
                {project.status}
              </Badge>
            </div>
          </div>

          {project.description && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {project.description}
            </p>
          )}

          {/* Admin: set/change owner (pick from current members) */}
          {isAdmin && project.members.length > 0 && (
            <form
              action={setProjectOwner}
              className="mt-3 flex items-end gap-2"
            >
              <input type="hidden" name="project_id" value={projectId} />
              <div>
                <Label htmlFor="owner_profile_id">Set project owner</Label>
                <select
                  id="owner_profile_id"
                  name="owner_profile_id"
                  defaultValue={owner?.profile_id ?? ""}
                  className="mt-1 block h-9 rounded-md border bg-background px-2"
                >
                  <option value="">— Select member —</option>
                  {project.members.map((m) => (
                    <option key={m.profile_id} value={m.profile_id}>
                      {m.display_name} {m.role ? `• ${m.role}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit">Save owner</Button>
            </form>
          )}
        </header>

        {/* Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left */}
          <div className="space-y-8">
            {/* Team (admins can remove/update members) */}
            <MembersList
              members={project.members as any}
              isAdmin={isAdmin}
              projectId={projectId}
              updateAction={updateMemberAction}
              removeAction={removeMemberAction}
            />

            {/* Department hours config */}
            {userId && (
              <DepartmentHoursTable
                projectId={projectId}
                deptHours={deptHours}
                allDepartments={isAdmin ? allDepartments : null}
                isAdmin={isAdmin}
                upsertAction={upsertDeptHoursAction}
                removeAction={removeDeptHoursAction}
              />
            )}

            {/* Required skills */}
            <RequiredSkills
              projectId={projectId}
              skills={project.skills}
              allSkills={isAdmin ? allSkills : null}
              isAdmin={isAdmin}
              addAction={addSkillAction}
              removeAction={removeSkillAction}
            />

            {/* Files */}
            <ProjectFiles
              projectId={projectId}
              files={files}
              isAdmin={isAdmin}
              uploadAction={uploadFileAction}
              deleteAction={deleteFileAction}
            />
          </div>

          {/* Right */}
          <div className="space-y-8">
            {/* Apply / Withdraw (hidden entirely if already a member) */}
            {!isMember && (
              <ApplicationForm
                projectId={projectId}
                userId={userId}
                iApplied={iApplied}
                applyAction={applyAction}
                withdrawAction={withdrawAction}
              />
            )}

            {/* Project Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Project Updates</CardTitle>
                <CardDescription>Status, goals, and notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Post new (owner/admin) */}
                {canPostUpdate && (
                  <form
                    action={createProjectUpdate}
                    className="space-y-3 border-b pb-4"
                  >
                    <input type="hidden" name="project_id" value={projectId} />
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Sprint 3 status"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="body">Details</Label>
                      <Textarea
                        id="body"
                        name="body"
                        rows={4}
                        placeholder="What changed, risks, next goals…"
                        className="mt-1.5"
                      />
                    </div>
                    <Button type="submit">Post update</Button>
                  </form>
                )}

                {/* Updates feed */}
                {updates.length ? (
                  <div className="space-y-4">
                    {updates.map((u) => (
                      <div key={u.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback>
                                {(u.author?.display_name || "U")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {u.title || "Update"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(u.created_at).toLocaleString()} •{" "}
                                {u.author?.display_name ?? "Unknown"}
                              </div>
                            </div>
                          </div>
                          {(isAdmin || isOwner) && (
                            <form action={deleteProjectUpdate}>
                              <input
                                type="hidden"
                                name="project_id"
                                value={projectId}
                              />
                              <input
                                type="hidden"
                                name="update_id"
                                value={u.id}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                type="submit"
                                aria-label="Delete update"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </form>
                          )}
                        </div>
                        {u.body && <p className="mt-3 text-sm">{u.body}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No updates yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Applicants (admin) */}
            {isAdmin && (
              <ApplicantsList
                projectId={projectId}
                applicants={applicants}
                roleOptions={[
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
                ]}
                approveAction={approveApplicantAction}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
