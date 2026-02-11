import { listProjects, createProject } from "@/app/actions/projects";
import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import { isAdmin as checkIsAdmin } from "@/lib/auth/server-auth";
import { Client, Department } from "@/types/pocketbase";
import { ProjectsClientView } from "@/components/projects/ProjectsClientView";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  status?: "planned" | "active" | "completed" | "on_hold" | "all";
  dep?: string;
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const pb = await createServerClient();

  const isAdmin = await checkIsAdmin();

  let departments: { id: string; name: string; consultant_count: number }[] = [];
  try {
    const records = await pb.collection("departments").getFullList<Department>({ sort: 'name', expand: 'leader' });
    const assignments = await pb.collection("profile_departments").getFullList();
    const countMap = new Map<string, number>();
    assignments.forEach(a => countMap.set(a.department, (countMap.get(a.department) || 0) + 1));

    departments = records.map(d => {
      return {
        id: d.id,
        name: d.name,
        consultant_count: countMap.get(d.id) || 0,
      };
    });
  } catch (e) {
    console.error("Error fetching departments", e);
  }

  let clients: Client[] = [];
  try {
    clients = await pb.collection("clients").getFullList<Client>({ sort: 'name' });
  } catch (e) {
    console.error("Error fetching clients", e);
  }

  const projects = await listProjects({
    search: params?.q,
    status: params?.status ?? "all",
    department: params?.dep,
  });

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
    <ProjectsClientView
      isAdmin={isAdmin}
      projects={projects}
      departments={departments}
      clients={clients}
      searchParams={params}
      createProjectAction={createProjectAction}
    />
  );
}
