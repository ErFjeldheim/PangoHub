"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { notFound } from "next/navigation";
import { mapUserToConsultant, computeExperienceYears } from "@/lib/utils/consultant";
import type {
  Consultant,
  Skill,
  Experience as ExperienceRow,
  Education as EducationRow,
} from "@/types/consultant";
import type {
  User,
  ProfileSkill,
  Experience,
  Education,
  ProfileDepartment,
  Skill as PBSkill,
  AvailabilityMonth,
} from "@/types/pocketbase";

function calculateStatus(available: number, committed: number): string {
  if (available <= 0) return "unavailable";
  if (committed >= available) return "busy";
  if (committed > 0) return "partly";
  return "available";
}

export async function searchConsultants(query: string): Promise<Consultant[]> {
  const pb = await createServerClient();

  let filter = "";
  if (query && query.trim()) {
    const q = query.trim().replace(/["\\]/g, "");
    filter = `first_name ~ "${q}" || last_name ~ "${q}" || email ~ "${q}"`;
  }

  const users = await pb.collection("users").getFullList<User>({
    filter,
    sort: "first_name",
  });

  if (users.length === 0) return [];

  const currentMonth = new Date().toISOString().substring(0, 7);
  let availabilityMap = new Map<string, string>();
  try {
    const availRecords = await pb
      .collection("availability_months")
      .getFullList<AvailabilityMonth>({
        filter: `month ~ "${currentMonth}"`,
      });
    availRecords.forEach((r) => {
      const status =
        r.status ||
        calculateStatus(r.hours_available || 0, r.hours_committed || 0);
      availabilityMap.set(r.user, status);
    });
  } catch (e) {
    console.error("Failed to fetch availability for search:", e);
  }

  // Batch-fetch all experiences in a single query, then group by user
  const experiencesByUser = new Map<string, Experience[]>();
  try {
    const userIds = users.map(u => u.id);
    const expFilter = userIds.map(id => `user="${id}"`).join(" || ");
    const allExps = await pb.collection("experiences").getFullList<Experience>({
      filter: expFilter,
      fields: "user,start_date,end_date",
    });
    allExps.forEach(e => {
      if (!experiencesByUser.has(e.user)) experiencesByUser.set(e.user, []);
      experiencesByUser.get(e.user)!.push(e);
    });
  } catch (e) {
    console.error("Failed to fetch experiences for search:", e);
  }

  return users.map((u) =>
    mapUserToConsultant(
      u,
      undefined,
      availabilityMap.get(u.id),
      computeExperienceYears(experiencesByUser.get(u.id) || []),
    ),
  );
}

export async function getConsultant(consultantId: string): Promise<Consultant> {
  const pb = await createServerClient();
  try {
    const user = await pb.collection("users").getOne<User>(consultantId);

    let deptName: string | undefined;
    try {
      const deptRel = await pb
        .collection("profile_departments")
        .getFirstListItem<ProfileDepartment>(
          `user="${consultantId}" && is_primary=true`,
          {
            expand: "department",
          },
        );
      if (deptRel.expand?.department) {
        deptName = deptRel.expand.department.name;
      }
    } catch {}

    return mapUserToConsultant(user, deptName);
  } catch {
    notFound();
  }
}

export async function getConsultantsForDepartment(
  departmentId: string,
): Promise<Consultant[]> {
  const pb = await createServerClient();
  try {
    const assignments = await pb
      .collection("profile_departments")
      .getFullList<ProfileDepartment>({
        filter: `department="${departmentId}"`,
        expand: "user",
      });

    const currentMonth = new Date().toISOString().substring(0, 7);
    const currentMonthFilter = `${currentMonth}`;
    let availabilityMap = new Map<string, string>();
    try {
      const availRecords = await pb
        .collection("availability_months")
        .getFullList<AvailabilityMonth>({
          filter: `month ~ "${currentMonthFilter}"`,
        });
      availRecords.forEach((r) => {
        const status =
          r.status ||
          calculateStatus(r.hours_available || 0, r.hours_committed || 0);
        availabilityMap.set(r.user, status);
      });
    } catch (e) {
      console.error("Failed to fetch availability for search:", e);
    }

    return assignments
      .map((a) => {
        const u = a.expand?.user as User;
        if (!u) return null;
        return mapUserToConsultant(u, undefined, availabilityMap.get(u.id));
      })
      .filter((u): u is Consultant => u !== null);
  } catch {
    return [];
  }
}

export async function getSkills(consultantId: string): Promise<Skill[]> {
  const pb = await createServerClient();
  const records = await pb
    .collection("profile_skills")
    .getFullList<ProfileSkill>({
      filter: `user="${consultantId}"`,
      expand: "skill",
      sort: "-proficiency",
    });

  return records.map((r) => {
    const skillName = (r.expand?.skill as PBSkill)?.name || "";
    return {
      proficiency: r.proficiency || 0,
      years: r.years || 0,
      skills: { name: skillName },
    };
  });
}

export async function getConsultantsBySkill(
  skillId: string,
): Promise<
  Array<{ consultant: Consultant; proficiency: number; years: number }>
> {
  const pb = await createServerClient();

  const records = await pb
    .collection("profile_skills")
    .getFullList<ProfileSkill>({
      filter: `skill="${skillId}"`,
      expand: "user",
      sort: "-proficiency",
    });

  const currentMonth = new Date().toISOString().substring(0, 7);
  let availabilityMap = new Map<string, string>();
  try {
    const availRecords = await pb
      .collection("availability_months")
      .getFullList<AvailabilityMonth>({
        filter: `month ~ "${currentMonth}"`,
      });
    availRecords.forEach((r) => {
      const status =
        r.status ||
        calculateStatus(r.hours_available || 0, r.hours_committed || 0);
      availabilityMap.set(r.user, status);
    });
  } catch (e) {
    console.error("Failed to fetch availability for skill list:", e);
  }

  const entries = records
    .map((r) => {
      const user = r.expand?.user as User | undefined;
      if (!user) return null;
      return {
        consultant: mapUserToConsultant(
          user,
          undefined,
          availabilityMap.get(user.id),
        ),
        proficiency: r.proficiency || 0,
        years: r.years || 0,
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        consultant: Consultant;
        proficiency: number;
        years: number;
      } => entry !== null,
    );

  entries.sort((a, b) => {
    if (b.proficiency !== a.proficiency) return b.proficiency - a.proficiency;
    return a.consultant.display_name.localeCompare(b.consultant.display_name);
  });

  return entries;
}

export async function getExperiences(
  consultantId: string,
): Promise<ExperienceRow[]> {
  const pb = await createServerClient();
  const records = await pb.collection("experiences").getFullList<Experience>({
    filter: `user="${consultantId}"`,
    sort: "-start_date",
  });

  return records.map((r) => ({
    id: r.id,
    profile_id: r.user,
    org: r.org,
    role: r.role,
    start_date: r.start_date,
    end_date: r.end_date || null,
    type: r.type || "",
    description: r.description || null,
    created_at: r.created,
    updated_at: r.updated,
  }));
}

export async function getEducations(
  consultantId: string,
): Promise<EducationRow[]> {
  const pb = await createServerClient();
  const records = await pb.collection("educations").getFullList<Education>({
    filter: `user="${consultantId}"`,
    sort: "-end_year",
  });

  return records.map((r) => ({
    id: r.id,
    profile_id: r.user,
    institution: r.institution,
    program: r.program || null,
    degree_level: r.degree_level || null,
    start_year: r.start_year || null,
    end_year: r.end_year || null,
    created_at: r.created,
    updated_at: r.updated,
  }));
}
