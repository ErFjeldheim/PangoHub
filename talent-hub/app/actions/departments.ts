"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { DepartmentDetails } from "@/types/department";

export async function getDepartments() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_departments_with_details");
  if (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
  return data;
}

export async function createDepartment(name: string, description: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .insert([{ name, description }])
    .select();
  if (error) {
    console.error("Error creating department:", error);
    return { error };
  }
  revalidatePath("/dashboard/departments");
  return { data };
}

export async function updateDepartment(
  id: string,
  values: {
    name: string;
    description: string;
    leader_profile_id: string | null;
  }
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .update(values)
    .eq("id", id)
    .select();
  if (error) {
    console.error("Error updating department:", error);
    return { error };
  }
  revalidatePath("/dashboard/departments");
  revalidatePath(`/dashboard/departments/${id}`);
  return { data };
}

export async function deleteDepartment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) {
    console.error("Error deleting department:", error);
    return { error };
  }
  revalidatePath("/dashboard/departments");
  return {};
}

export async function addConsultantToDepartment(
  departmentId: string,
  profileId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles_departments")
    .insert({ department_id: departmentId, profile_id: profileId });
  if (error) {
    console.error("Error adding consultant to department:", error);
    return { error };
  }
  revalidatePath(`/dashboard/departments/${departmentId}`);
  return {};
}

export async function removeConsultantFromDepartment(
  departmentId: string,
  profileId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles_departments")
    .delete()
    .eq("department_id", departmentId)
    .eq("profile_id", profileId);
  if (error) {
    console.error("Error removing consultant from department:", error);
    return { error };
  }
  revalidatePath(`/dashboard/departments/${departmentId}`);
  return {};
}

export type DepartmentOverview = {
  id: string;
  name: string;
  leaderName: string | null;
  totalConsultants: number;
  availableConsultants: number;
};

type RawRollupRow = {
  department_id: string;
  department_name: string;
  leader_name: string | null;
  total_consultants: number;
  available_consultants: number;
};

export async function getDepartmentsOverview(): Promise<DepartmentOverview[]> {
  const supabase = await createClient();

  // No generics, no `.returns()` — keep it simple
  const { data, error } = await supabase.rpc("get_department_rollup");

  if (error) {
    console.error("Error fetching department overview:", error);
    return [];
  }

  // Narrow to array at runtime (and at the same time, at type level)
  const rows: RawRollupRow[] = Array.isArray(data)
    ? (data as RawRollupRow[])
    : [];

  return rows.map(
    (r): DepartmentOverview => ({
      id: r.department_id,
      name: r.department_name,
      leaderName: r.leader_name,
      totalConsultants: r.total_consultants,
      availableConsultants: r.available_consultants,
    })
  );
}

// app/actions/departments.ts
export async function getAllDepartmentsBasic(): Promise<
  Array<{ id: string; name: string }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getDepartmentDetails(
  id: string
): Promise<DepartmentDetails | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_departments_with_details");

  if (error) {
    console.error("Error fetching department details:", error);
    return null;
  }
  const row = (data ?? []).find((d: DepartmentDetails) => d.id === id);
  if (!row) return null;

  // If you also want the raw leader_profile_id in UI, fetch it directly:
  const { data: deptRow } = await supabase
    .from("departments")
    .select("leader_profile_id")
    .eq("id", id)
    .single();

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    consultant_count: Number(row.consultant_count ?? 0),
    leader_name: row.leader_name ?? null,
    leader_profile_id: deptRow?.leader_profile_id ?? null,
  };
}

// app/actions/departments.ts
export async function assignDepartmentLeader(
  departmentId: string,
  leaderProfileId: string | null
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("departments")
    .update({ leader_profile_id: leaderProfileId })
    .eq("id", departmentId);

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
