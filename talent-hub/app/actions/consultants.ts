"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { notFound } from "next/navigation";
import type {
  Consultant,
  Skill,
  Experience as ExperienceRow,
  Education as EducationRow,
} from "@/types/consultant";
import type { User, ProfileSkill, Experience, Education, ProfileDepartment, Skill as PBSkill } from "@/types/pocketbase";

function mapUserToConsultant(u: User, deptName?: string): Consultant {
    return {
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        title: u.title || null,
        bio: u.bio || null,
        phone: u.phone || null,
        location: u.location || null,
        linkedin_url: u.linkedin_url || null,
        github_url: u.github_url || null,
        portfolio_url: u.portfolio_url || null,
        created_at: u.created,
        updated_at: u.updated,
        display_name: u.display_name || `${u.first_name} ${u.last_name}`,
        email: u.email,
        availability_status: null,
        experience_years: null,
        primary_department: deptName || null,
    }
}

export async function searchConsultants(query: string): Promise<Consultant[]> {
  const pb = await createServerClient();

  let filter = '';
  if (query && query.trim()) {
      const q = query.trim();
      filter = `first_name ~ "${q}" || last_name ~ "${q}" || email ~ "${q}"`;
  }

  const users = await pb.collection("users").getFullList<User>({
      filter,
      sort: 'first_name'
  });

  return users.map(u => mapUserToConsultant(u));
}

export async function getConsultant(consultantId: string): Promise<Consultant> {
  const pb = await createServerClient();
  try {
      const user = await pb.collection("users").getOne<User>(consultantId);
      
      let deptName: string | undefined;
      try {
          const deptRel = await pb.collection("profile_departments").getFirstListItem<ProfileDepartment>(`user="${consultantId}" && is_primary=true`, {
              expand: 'department'
          });
          if (deptRel.expand?.department) {
              deptName = deptRel.expand.department.name;
          }
      } catch {}

      return mapUserToConsultant(user, deptName);
  } catch {
      notFound();
  }
}

export async function getConsultantsForDepartment(departmentId: string): Promise<Consultant[]> {
  const pb = await createServerClient();
  try {
      const assignments = await pb.collection("profile_departments").getFullList<ProfileDepartment>({
          filter: `department="${departmentId}"`,
          expand: 'user'
      });
      
      return assignments.map(a => {
          const u = a.expand?.user as User;
          if (!u) return null;
          return mapUserToConsultant(u);
      }).filter((u): u is Consultant => u !== null);
  } catch {
      return [];
  }
}

export async function getSkills(consultantId: string): Promise<Skill[]> {
  const pb = await createServerClient();
  const records = await pb.collection("profile_skills").getFullList<ProfileSkill>({
      filter: `user="${consultantId}"`,
      expand: 'skill',
      sort: '-proficiency'
  });

  return records.map(r => {
      const skillName = (r.expand?.skill as PBSkill)?.name || "";
      return {
          proficiency: r.proficiency || 0,
          years: r.years || 0,
          skills: { name: skillName }
      };
  });
}

export async function getExperiences(consultantId: string): Promise<ExperienceRow[]> {
  const pb = await createServerClient();
  const records = await pb.collection("experiences").getFullList<Experience>({
      filter: `user="${consultantId}"`,
      sort: '-start_date'
  });

  return records.map(r => ({
      id: r.id,
      profile_id: r.user,
      org: r.org,
      role: r.role,
      start_date: r.start_date,
      end_date: r.end_date || null,
      type: r.type || "",
      description: r.description || null,
      created_at: r.created,
      updated_at: r.updated
  }));
}

export async function getEducations(consultantId: string): Promise<EducationRow[]> {
  const pb = await createServerClient();
  const records = await pb.collection("educations").getFullList<Education>({
      filter: `user="${consultantId}"`,
      sort: '-end_year'
  });

  return records.map(r => ({
      id: r.id,
      profile_id: r.user,
      institution: r.institution,
      program: r.program || null,
      degree_level: r.degree_level || null,
      start_year: r.start_year || null,
      end_year: r.end_year || null,
      created_at: r.created,
      updated_at: r.updated
  }));
}
