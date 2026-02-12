"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import type { Project, ProfileSkill, Skill, User, AvailabilityMonth } from "@/types/pocketbase";
import { Consultant } from "@/types/consultant";
import { requireSalesAccess } from "@/lib/auth/server-auth";

export type SalesLead = Project & {
  matchCount?: number;
};

export type MatchResult = {
  consultant: Consultant;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  availability: {
    status: string;
    hoursAvailable: number;
  };
};

export async function getSalesLeads() {
  await requireSalesAccess();
  const pb = await createServerClient();
  const leads = await pb.collection("projects").getFullList<SalesLead>({
    filter: 'status = "lead"',
    sort: "-id",
    expand: "client",
  });
  return leads;
}

export async function createSalesLead(data: {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  hoursRequired?: number;
  skills?: string[];
}) {
  await requireSalesAccess();
  const pb = await createServerClient();
  
  try {
    const record = await pb.collection("projects").create({
      name: data.name,
      description: data.description,
      status: "lead",
      start_date: data.startDate,
      end_date: data.endDate,
      hours_required: data.hoursRequired,
    });

    if (data.skills && data.skills.length > 0) {
        for (const skillName of data.skills) {
            try {
                const skill = await pb.collection("skills").getFirstListItem(`name="${skillName}"`);
                await pb.collection("project_skills").create({
                    project: record.id,
                    skill: skill.id
                });
            } catch {
            }
        }
    }

    revalidatePath("/dashboard/sales");
    return { id: record.id };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create lead" };
  }
}

export async function findMatchingConsultants(
  requiredSkills: string[],
  startDate?: string,
  endDate?: string
): Promise<MatchResult[]> {
  await requireSalesAccess();
  const pb = await createServerClient();

  const users = await pb.collection("users").getFullList<User>({
      sort: '-id'
  });
  const userSkills = await pb.collection("profile_skills").getFullList<ProfileSkill>({
      expand: "skill"
  });

  const targetMonth = startDate ? startDate.substring(0, 7) : new Date().toISOString().substring(0, 7);
  
  const availabilityRecords = await pb.collection("availability_months").getFullList<AvailabilityMonth>({
      filter: `month = "${targetMonth}"`
  });
  const availabilityMap = new Map<string, AvailabilityMonth>();
  availabilityRecords.forEach(r => availabilityMap.set(r.user, r));

  const results: MatchResult[] = users.map(user => {
      const mySkills = userSkills.filter(ps => ps.user === user.id).map(ps => (ps.expand?.skill as Skill)?.name);
      
      const matched = requiredSkills.filter(req => mySkills.includes(req));
      const missing = requiredSkills.filter(req => !mySkills.includes(req));
      
      let score = 0;
      if (requiredSkills.length > 0) {
          score = (matched.length / requiredSkills.length) * 100;
      } else {
          score = 100;
      }

      const avail = availabilityMap.get(user.id);
      const status = avail?.status || "unknown";
      const hours = avail?.hours_available || 0;
      const hoursFree = hours - (avail?.hours_committed || 0);

      if (status === 'available' || hoursFree > 0) {
      } else if (status === 'busy' || hoursFree <= 0) {
          score = score * 0.5;
      }

      return {
          consultant: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              display_name: user.display_name || `${user.first_name} ${user.last_name}`,
              email: user.email,
              title: user.title || null,
              bio: null, phone: null, location: null, linkedin_url: null, github_url: null, portfolio_url: null,
              created_at: user.created, updated_at: user.updated,
              availability_status: status as any,
              experience_years: null,
              primary_department: null
          },
          score: Math.round(score),
          matchedSkills: matched,
          missingSkills: missing,
          availability: {
              status: status,
              hoursAvailable: hoursFree
          }
      };
  });

  return results.sort((a, b) => b.score - a.score);
}

export async function getLeadRequirements(projectId: string) {
    const pb = await createServerClient();
    const projectSkills = await pb.collection("project_skills").getFullList({
        filter: `project="${projectId}"`,
        expand: "skill"
    });
    
    return {
        skills: projectSkills.map(ps => ps.expand?.skill?.name).filter(Boolean) as string[]
    };
}
