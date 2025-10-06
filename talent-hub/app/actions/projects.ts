"use server";

import { createClient } from "@/lib/supabase/server";

export async function getProjectsForDepartment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_projects_for_department", { p_department_id: id });
  if (error) {
    console.error("Error fetching projects for department:", error);
    return [];
  }
  return data;
}

export async function getActiveProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("status", "active");

  if (error) {
    console.error("Error fetching active projects:", error);
    return [];
  }
  return data;
}