"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import { DepartmentDetails } from "@/types/department";
import { Department, User, ProfileDepartment, AvailabilityMonth } from "@/types/pocketbase";

function calculateStatus(available: number, committed: number): string {
    if (available <= 0) return "unavailable";
    if (committed >= available) return "busy";
    if (committed > 0) return "partly";
    return "available";
}

export async function getDepartments() {
  const pb = await createServerClient();
  const departments = await pb.collection('departments').getFullList<Department>({
      expand: 'leader',
      sort: 'name'
  });

  const allAssignments = await pb.collection('profile_departments').getFullList<ProfileDepartment>();
  
  const countMap = new Map<string, number>();
  const availableCountMap = new Map<string, number>();

  // Fetch current month availability
  const currentMonth = new Date().toISOString().substring(0, 7);
  let availabilityMap = new Map<string, { status: string; hours_available: number }>();
  try {
      const availRecords = await pb.collection("availability_months").getFullList<AvailabilityMonth>({
          filter: `month ~ "${currentMonth}"`
      });
      availRecords.forEach(r => {
          const status = r.status || calculateStatus(r.hours_available || 0, r.hours_committed || 0);
          availabilityMap.set(r.user, { 
              status, 
              hours_available: r.hours_available || 0 
          });
      });
  } catch (e) {
      console.error("Failed to fetch availability for departments:", e);
  }

  for (const a of allAssignments) {
      countMap.set(a.department, (countMap.get(a.department) || 0) + 1);
      
      const avail = availabilityMap.get(a.user);
      if (avail) {
          // A consultant is available if status === 'available' OR (hours_available > 0 AND status !== 'busy')
          const isAvailable = avail.status === 'available' || (avail.hours_available > 0 && avail.status !== 'busy');
          if (isAvailable) {
              availableCountMap.set(a.department, (availableCountMap.get(a.department) || 0) + 1);
          }
      }
  }

  return departments.map(d => {
      const leader = d.expand?.leader as User | undefined;
      return {
          id: d.id,
          name: d.name,
          description: d.description || "",
          leader_name: leader ? (leader.display_name || `${leader.first_name} ${leader.last_name}`) : null,
          consultant_count: countMap.get(d.id) || 0,
          available_count: availableCountMap.get(d.id) || 0
      }
  });
}

export async function createDepartment(name: string, description: string) {
  const pb = await createServerClient();
  try {
      const data = await pb.collection("departments").create({ name, description });
      revalidatePath("/dashboard/departments");
      return { data };
  } catch (err) {
      const error = err as Error;
      console.error("Error creating department:", error);
      return { error: { message: error.message } };
  }
}

export async function updateDepartment(
  id: string,
  values: {
    name: string;
    description: string;
    leader_profile_id: string | null;
  }
) {
  const pb = await createServerClient();
  try {
      const data = await pb.collection("departments").update(id, {
          name: values.name,
          description: values.description,
          leader: values.leader_profile_id
      });
      revalidatePath("/dashboard/departments");
      revalidatePath(`/dashboard/departments/${id}`);
      return { data };
  } catch (err) {
      const error = err as Error;
      console.error("Error updating department:", error);
      return { error: { message: error.message } };
  }
}

export async function deleteDepartment(id: string) {
  const pb = await createServerClient();
  try {
      await pb.collection("departments").delete(id);
      revalidatePath("/dashboard/departments");
      return {};
  } catch (err) {
      const error = err as Error;
      console.error("Error deleting department:", error);
      return { error: { message: error.message } };
  }
}

export async function addConsultantToDepartment(
  departmentId: string,
  profileId: string
) {
  const pb = await createServerClient();
  try {
      await pb.collection("profile_departments").create({
          department: departmentId,
          user: profileId,
          is_primary: false
      });
      revalidatePath(`/dashboard/departments/${departmentId}`);
      return {};
  } catch (err) {
      const error = err as Error;
      console.error("Error adding consultant to department:", error);
      return { error: { message: error.message } };
  }
}

export async function removeConsultantFromDepartment(
  departmentId: string,
  profileId: string
) {
  const pb = await createServerClient();
  try {
      const record = await pb.collection("profile_departments").getFirstListItem(`department="${departmentId}" && user="${profileId}"`);
      await pb.collection("profile_departments").delete(record.id);
      revalidatePath(`/dashboard/departments/${departmentId}`);
      return {};
  } catch (err) {
      const error = err as Error;
      console.error("Error removing consultant from department:", error);
      return { error: { message: error.message } };
  }
}

export type DepartmentOverview = {
  id: string;
  name: string;
  leaderName: string | null;
  totalConsultants: number;
  availableConsultants: number;
};

export async function getDepartmentsOverview(): Promise<DepartmentOverview[]> {
  const pb = await createServerClient();
  
  // 1. Fetches all departments.
  const departments = await pb.collection('departments').getFullList<Department>({
      expand: 'leader',
      sort: 'name'
  });

  // 2. Fetches all user departments (profile_departments).
  const allAssignments = await pb.collection('profile_departments').getFullList<ProfileDepartment>();
  
  // 3. Fetches all availability records for the current month.
  const currentMonth = new Date().toISOString().substring(0, 7);
  const availabilityMap = new Map<string, { status: string; hours: number }>();
  
  try {
      const availRecords = await pb.collection("availability_months").getFullList<AvailabilityMonth>({
          filter: `month ~ "${currentMonth}"`
      });
      availRecords.forEach(r => {
          const status = r.status || calculateStatus(r.hours_available || 0, r.hours_committed || 0);
          availabilityMap.set(r.user, {
              status,
              hours: r.hours_available || 0
          });
      });
  } catch (e) {
      console.error("Failed to fetch availability for overview:", e);
  }

  // 4. Calculates the number of available consultants per department.
  const countMap = new Map<string, number>();
  const availableCountMap = new Map<string, number>();

  for (const a of allAssignments) {
      // Total consultants count
      countMap.set(a.department, (countMap.get(a.department) || 0) + 1);
      
      // Available consultants count
      const avail = availabilityMap.get(a.user);
      if (avail) {
          // A consultant is available if status === 'available' OR (hours_available > 0 AND status !== 'busy')
          const isAvailable = avail.status === 'available' || (avail.hours > 0 && avail.status !== 'busy');
          if (isAvailable) {
              availableCountMap.set(a.department, (availableCountMap.get(a.department) || 0) + 1);
          }
      }
  }

  // 5. Returns the DepartmentOverview array with correct consultantCount and availableConsultants.
  return departments.map(d => {
      const leader = d.expand?.leader as User | undefined;
      return {
          id: d.id,
          name: d.name,
          leaderName: leader ? (leader.display_name || `${leader.first_name} ${leader.last_name}`) : null,
          totalConsultants: countMap.get(d.id) || 0,
          availableConsultants: availableCountMap.get(d.id) || 0
      }
  });
}

export async function getAllDepartmentsBasic(): Promise<
  Array<{ id: string; name: string }>
> {
  const pb = await createServerClient();
  const departments = await pb.collection("departments").getFullList({
      sort: "name",
      fields: "id,name"
  });
  return departments.map(d => ({ id: d.id, name: d.name }));
}

export async function getDepartmentDetails(
  id: string
): Promise<DepartmentDetails | null> {
  const pb = await createServerClient();
  try {
      const d = await pb.collection("departments").getOne<Department>(id, { expand: 'leader' });
      
      const assignments = await pb.collection("profile_departments").getFullList({
          filter: `department="${id}"`
      });
      
      const leader = d.expand?.leader as User | undefined;

      return {
        id: d.id,
        name: d.name,
        description: d.description || null,
        consultant_count: assignments.length,
        leader_name: leader ? (leader.display_name || `${leader.first_name} ${leader.last_name}`) : null,
        leader_profile_id: d.leader || null,
      };
  } catch {
      return null;
  }
}

export async function assignDepartmentLeader(
  departmentId: string,
  leaderProfileId: string | null
) {
  const pb = await createServerClient();
  try {
      await pb.collection("departments").update(departmentId, {
          leader: leaderProfileId
      });
      return { ok: true };
  } catch (err) {
      const error = err as Error;
      return { ok: false, error: error.message };
  }
}
