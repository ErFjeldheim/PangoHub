import { listProjects, createProject } from "@/app/actions/projects";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { ProjectFilters } from "@/components/projects/project-filters";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  status?: "planned" | "active" | "completed" | "on_hold" | "all";
  dep?: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const supabase = await createClient();

  // Fetch admin flag
  const { data: auth } = await supabase.auth.getUser();
  let isAdmin = false;
  if (auth?.user) {
    const { data } = await supabase.rpc("is_admin", { uid: auth.user.id });
    isAdmin = !!data;
  }

  // Fetch departments for dropdown
  const { data: departments } = await supabase.rpc(
    "get_departments_with_details"
  );

  // Fetch clients for the create form dropdown
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name", { ascending: true });

  // Fetch filtered projects
  const projects = await listProjects({
    search: searchParams?.q,
    status: searchParams?.status ?? "all",
    department: searchParams?.dep,
  });

  // Server action for the form submit
  async function createProjectAction(formData: FormData) {
    "use server";
    const name = (formData.get("name") as string)?.trim();
    if (!name) throw new Error("Project name is required.");

    const description = (formData.get("description") as string) || undefined;
    const client_id = (formData.get("client_id") as string) || undefined;
    const status = ((formData.get("status") as string) || "active") as
      | "planned"
      | "active"
      | "completed"
      | "on_hold";
    const start_date = (formData.get("start_date") as string) || undefined;
    const end_date = (formData.get("end_date") as string) || undefined;

    await createProject({
      name,
      description,
      client_id: client_id || null,
      status,
      start_date: start_date || null,
      end_date: end_date || null,
    });

    revalidatePath("/projects");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 lg:p-8 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-lg">
            Manage and track all your projects in one place
          </p>
        </header>

        {/* Admin: Create Project */}
        {isAdmin && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-auto bg-transparent"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Project
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <CreateProjectForm
                action={createProjectAction}
                clients={clients}
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Filters */}
        <ProjectFilters searchParams={searchParams} departments={departments} />

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={{ ...p, departments: p.departments ?? undefined }}
              href={`/dashboard/projects/${p.id}`}
            />
          ))}

          {!projects.length && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                No projects match your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
