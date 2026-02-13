"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { revalidatePath } from "next/cache";
import type { Project, ProfileSkill, Skill, User, AvailabilityMonth, ProfileDepartment, Department } from "@/types/pocketbase";
import { Consultant } from "@/types/consultant";
import { requireSalesAccess } from "@/lib/auth/server-auth";
import { PROJECT_TEMPLATES, HOURLY_RATE } from "@/lib/sales/templates";

export type SalesLead = Project & {
  matchCount?: number;
  totalHours?: number;
  totalPrice?: number;
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
  pb.autoCancellation(false);
  const leads = await pb.collection("projects").getFullList<SalesLead>({
    filter: 'status = "lead"',
    sort: "-id",
    expand: "client",
    requestKey: null,
  });

  const enrichedLeads = await Promise.all(leads.map(async (lead) => {
    const hours = await pb.collection("project_department_hours").getFullList({
      filter: `project="${lead.id}"`,
      requestKey: null,
    });
    
    let totalHours = lead.hours_required || 0;
    if (totalHours === 0 && hours.length > 0) {
        totalHours = hours.reduce((acc, curr) => acc + (curr.hours_required || 0), 0);
    }

    return {
      ...lead,
      totalHours,
      totalPrice: totalHours * HOURLY_RATE
    };
  }));

  return enrichedLeads;
}

export async function createSalesLeadFromTemplate(data: {
  templateId: string;
  name: string;
  startDate?: string;
  endDate?: string;
}) {
  await requireSalesAccess();
  const pb = await createServerClient();
  
  const template = PROJECT_TEMPLATES.find(t => t.id === data.templateId);
  if (!template) throw new Error("Template not found");

  try {
    const record = await pb.collection("projects").create({
      name: data.name,
      description: template.description,
      status: "lead",
      start_date: data.startDate,
      end_date: data.endDate,
      template_id: data.templateId,
    });

    for (const dept of template.departments) {
      try {
        const deptRecord = await pb.collection("departments").getFirstListItem(`name="${dept.name}"`);
        await pb.collection("project_department_hours").create({
          project: record.id,
          department: deptRecord.id,
          hours_required: dept.hours,
        });

        for (const skillName of dept.requiredSkills) {
          try {
            const skill = await pb.collection("skills").getFirstListItem(`name="${skillName}"`);
            await pb.collection("project_skills").create({
              project: record.id,
              skill: skill.id,
            });
          } catch {
          }
        }
      } catch {
      }
    }

    revalidatePath("/dashboard/sales");
    return { id: record.id };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create lead from template" };
  }
}

export async function createSalesLead(data: {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  hoursRequired?: number;
  skills?: string[];
  departmentHours?: Record<string, number>;
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

    if (data.departmentHours) {
        for (const [deptName, hours] of Object.entries(data.departmentHours)) {
            try {
                const dept = await pb.collection("departments").getFirstListItem(`name="${deptName}"`);
                await pb.collection("project_department_hours").create({
                    project: record.id,
                    department: dept.id,
                    hours_required: hours
                });
            } catch (e) {
                console.error(`Failed to create hours for ${deptName}:`, e);
            }
        }
    }

    if (data.skills && data.skills.length > 0) {
        for (const skillName of data.skills) {
            try {
                let skill;
                try {
                    skill = await pb.collection("skills").getFirstListItem(`name="${skillName}"`);
                } catch {
                    skill = await pb.collection("skills").create({ name: skillName });
                }
                
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

export async function deleteSalesLead(projectId: string) {
  await requireSalesAccess();
  const pb = await createServerClient();
  
  try {
      await pb.collection("projects").delete(projectId);
      revalidatePath("/dashboard/sales");
      return { ok: true };
  } catch (e) {
      console.error(e);
      return { error: "Failed to delete lead" };
  }
}

export async function updateSalesLead(projectId: string, data: {
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  hoursRequired?: number;
  skills?: string[];
  departmentHours?: Record<string, number>;
}) {
  await requireSalesAccess();
  const pb = await createServerClient();
  
  try {
    await pb.collection("projects").update(projectId, {
      name: data.name,
      description: data.description,
      start_date: data.startDate,
      end_date: data.endDate,
      hours_required: data.hoursRequired,
    });

    if (data.departmentHours) {
        for (const [deptName, hours] of Object.entries(data.departmentHours)) {
            try {
                const dept = await pb.collection("departments").getFirstListItem(`name="${deptName}"`);
                const existing = await pb.collection("project_department_hours").getFirstListItem(`project="${projectId}" && department="${dept.id}"`).catch(() => null);
                
                if (existing) {
                    await pb.collection("project_department_hours").update(existing.id, {
                        hours_required: hours
                    });
                } else {
                    await pb.collection("project_department_hours").create({
                        project: projectId,
                        department: dept.id,
                        hours_required: hours
                    });
                }
            } catch (e) {
                console.error(`Failed to update hours for ${deptName}:`, e);
            }
        }
    }

    if (data.skills) {
        const existingSkills = await pb.collection("project_skills").getFullList({
            filter: `project="${projectId}"`
        });
        for (const es of existingSkills) {
            await pb.collection("project_skills").delete(es.id);
        }

        for (const skillName of data.skills) {
            try {
                let skill;
                try {
                    skill = await pb.collection("skills").getFirstListItem(`name="${skillName}"`);
                } catch {
                    skill = await pb.collection("skills").create({ name: skillName });
                }
                
                await pb.collection("project_skills").create({
                    project: projectId,
                    skill: skill.id
                });
            } catch {
            }
        }
    }

    revalidatePath("/dashboard/sales");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update lead" };
  }
}

export async function updateLeadHours(projectId: string, departmentHours: Record<string, number>) {
    await requireSalesAccess();
    const pb = await createServerClient();

    let totalHours = 0;
    for (const [deptName, hours] of Object.entries(departmentHours)) {
        const val = Number(hours) || 0;
        totalHours += val;
        try {
            const dept = await pb.collection("departments").getFirstListItem(`name="${deptName}"`);
            const existing = await pb.collection("project_department_hours").getFirstListItem(`project="${projectId}" && department="${dept.id}"`).catch(() => null);
            
            if (existing) {
                await pb.collection("project_department_hours").update(existing.id, {
                    hours_required: val
                });
            } else if (val > 0) {
                await pb.collection("project_department_hours").create({
                    project: projectId,
                    department: dept.id,
                    hours_required: val
                });
            }
        } catch (e) {
            console.error(`Failed to update hours for ${deptName}:`, e);
        }
    }

    await pb.collection("projects").update(projectId, {
        hours_required: totalHours
    });

    revalidatePath("/dashboard/sales");
    return { ok: true, totalHours, totalPrice: totalHours * HOURLY_RATE };
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
  const userDepts = await pb.collection("profile_departments").getFullList<ProfileDepartment>({
      expand: "department"
  });

  const targetMonth = startDate ? startDate.substring(0, 7) : new Date().toISOString().substring(0, 7);
  
  const availabilityRecords = await pb.collection("availability_months").getFullList<AvailabilityMonth>({
      filter: `month ~ "${targetMonth}"`
  });
  const availabilityMap = new Map<string, AvailabilityMonth>();
  availabilityRecords.forEach(r => availabilityMap.set(r.user, r));

  const results: MatchResult[] = users.map(user => {
      const mySkills = userSkills.filter(ps => ps.user === user.id).map(ps => (ps.expand?.skill as Skill)?.name);
      
      const myDepts = userDepts.filter(pd => pd.user === user.id);
      const primaryDept = myDepts.find(pd => pd.is_primary) || myDepts[0];
      const deptName = (primaryDept?.expand?.department as Department)?.name || null;

      const matched = requiredSkills.filter(req => mySkills.includes(req));
      const missing = requiredSkills.filter(req => !mySkills.includes(req));
      
      let score = 0;
      if (requiredSkills.length > 0) {
          score = (matched.length / requiredSkills.length) * 100;
      } else {
          score = 100;
      }

      const avail = availabilityMap.get(user.id);
      const hours = avail?.hours_available || 0;
      const committed = avail?.hours_committed || 0;
      const hoursFree = hours - committed;

      let status = avail?.status || "unknown";
      if (!avail?.status && avail) {
          if (hours <= 0) status = "unavailable";
          else if (committed >= hours) status = "busy";
          else if (committed > 0) status = "partial";
          else status = "available";
      }

      if (status === 'busy' || (status === 'unknown' && hoursFree <= 0)) {
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
              primary_department: deptName
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
    await requireSalesAccess();
    const pb = await createServerClient();
    const projectSkills = await pb.collection("project_skills").getFullList({
        filter: `project="${projectId}"`,
        expand: "skill"
    });
    
    return {
        skills: projectSkills.map(ps => ps.expand?.skill?.name).filter(Boolean) as string[]
    };
}

export async function getLeadDepartmentHours(projectId: string) {
    await requireSalesAccess();
    const pb = await createServerClient();
    const records = await pb.collection("project_department_hours").getFullList({
        filter: `project="${projectId}"`,
        expand: "department"
    });

    const hours: Record<string, number> = {};
    records.forEach(r => {
        const name = r.expand?.department?.name;
        if (name) hours[name] = r.hours_required || 0;
    });
    return hours;
}

export type TeamMember = {
    consultant: Consultant;
    coveredSkills: string[];
    matchScore: number;
};

export type TeamSlot = {
    role: string;
    department: string;
    members: TeamMember[];
    missingSkills: string[];
    hours: number;
};

export async function getSuggestedTeam(projectId: string): Promise<TeamSlot[]> {
    await requireSalesAccess();
    const pb = await createServerClient();
    const project = await pb.collection("projects").getOne(projectId);
    
    const month = project.start_date ? project.start_date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const users = await pb.collection("users").getFullList<User>();
    const userSkills = await pb.collection("profile_skills").getFullList<ProfileSkill>({ expand: "skill" });
    const userDepts = await pb.collection("profile_departments").getFullList<ProfileDepartment>({ expand: "department" });
    const availRecords = await pb.collection("availability_months").getFullList<AvailabilityMonth>({
        filter: `month ~ "${month}"`
    });

    const globalUsedUserIds = new Set<string>();
    const slots: TeamSlot[] = [];

    if (!project.template_id) {
        const depts = await pb.collection("project_department_hours").getFullList({
            filter: `project="${projectId}"`,
            expand: "department"
        });
        const allRequiredSkills = (await getLeadRequirements(projectId)).skills;

        if (depts.length === 0 && allRequiredSkills.length > 0) {
            let remainingSkills = [...allRequiredSkills];
            const slotMembers: TeamMember[] = [];

            while (remainingSkills.length > 0) {
                let bestCandidate: User | null = null;
                let bestCovered: string[] = [];
                let bestScore = -1;

                const candidates = users.filter(u => !globalUsedUserIds.has(u.id));

                for (const u of candidates) {
                    const mySkills = userSkills.filter(ps => ps.user === u.id).map(ps => (ps.expand?.skill as Skill)?.name);
                    const matchedForThisSlot = remainingSkills.filter(s => mySkills.includes(s));
                    
                    if (matchedForThisSlot.length === 0) continue;

                    let score = (matchedForThisSlot.length / allRequiredSkills.length) * 100;
                    const avail = availRecords.find(a => a.user === u.id);
                    if (avail && avail.status === 'busy') score *= 0.5;

                    if (score > bestScore) {
                        bestScore = score;
                        bestCandidate = u;
                        bestCovered = matchedForThisSlot;
                    }
                }

                if (bestCandidate) {
                    const avail = availRecords.find(a => a.user === bestCandidate!.id);
                    globalUsedUserIds.add(bestCandidate.id);
                    const primaryDept = userDepts.filter(pd => pd.user === bestCandidate!.id).find(pd => pd.is_primary) || userDepts.find(pd => pd.user === bestCandidate!.id);
                    slotMembers.push({
                        consultant: {
                            id: bestCandidate.id,
                            first_name: bestCandidate.first_name,
                            last_name: bestCandidate.last_name,
                            display_name: bestCandidate.display_name || `${bestCandidate.first_name} ${bestCandidate.last_name}`,
                            email: bestCandidate.email,
                            title: bestCandidate.title || null,
                            bio: null, phone: null, location: null, linkedin_url: null, github_url: null, portfolio_url: null,
                            created_at: bestCandidate.created, updated_at: bestCandidate.updated,
                            availability_status: (avail?.status as any) || "available",
                            experience_years: null,
                            primary_department: (primaryDept?.expand?.department as Department)?.name || "Mixed"
                        },
                        coveredSkills: bestCovered,
                        matchScore: Math.round(bestScore)
                    });
                    remainingSkills = remainingSkills.filter(s => !bestCovered.includes(s));
                } else {
                    break;
                }
            }

            return [{
                role: "Core Team",
                department: "Project",
                members: slotMembers,
                missingSkills: remainingSkills,
                hours: project.hours_required || 0
            }];
        }

        for (const d of depts) {
            if ((d.hours_required || 0) <= 0) continue;
            let remainingSkills = [...allRequiredSkills];
            const slotMembers: TeamMember[] = [];
            const deptName = d.expand?.department?.name || "Unknown";

            while (remainingSkills.length > 0) {
                let bestCandidate: User | null = null;
                let bestCovered: string[] = [];
                let bestScore = -1;

                const candidates = users.filter(u => !globalUsedUserIds.has(u.id));

                for (const u of candidates) {
                    const inDept = userDepts.some(pd => pd.user === u.id && pd.expand?.department?.name === deptName);
                    if (!inDept) continue;

                    const mySkills = userSkills.filter(ps => ps.user === u.id).map(ps => (ps.expand?.skill as Skill)?.name);
                    const matchedForThisSlot = remainingSkills.filter(s => mySkills.includes(s));
                    
                    if (matchedForThisSlot.length === 0) continue;

                    let score = (matchedForThisSlot.length / allRequiredSkills.length) * 100;
                    const avail = availRecords.find(a => a.user === u.id);
                    if (avail && avail.status === 'busy') score *= 0.5;

                    if (score > bestScore) {
                        bestScore = score;
                        bestCandidate = u;
                        bestCovered = matchedForThisSlot;
                    }
                }

                if (bestCandidate) {
                    const avail = availRecords.find(a => a.user === bestCandidate!.id);
                    globalUsedUserIds.add(bestCandidate.id);
                    const primaryDept = userDepts.filter(pd => pd.user === bestCandidate!.id).find(pd => pd.is_primary) || userDepts.find(pd => pd.user === bestCandidate!.id);
                    slotMembers.push({
                        consultant: {
                            id: bestCandidate.id,
                            first_name: bestCandidate.first_name,
                            last_name: bestCandidate.last_name,
                            display_name: bestCandidate.display_name || `${bestCandidate.first_name} ${bestCandidate.last_name}`,
                            email: bestCandidate.email,
                            title: bestCandidate.title || null,
                            bio: null, phone: null, location: null, linkedin_url: null, github_url: null, portfolio_url: null,
                            created_at: bestCandidate.created, updated_at: bestCandidate.updated,
                            availability_status: (avail?.status as any) || "available",
                            experience_years: null,
                            primary_department: (primaryDept?.expand?.department as Department)?.name || deptName
                        },
                        coveredSkills: bestCovered,
                        matchScore: Math.round(bestScore)
                    });
                    remainingSkills = remainingSkills.filter(s => !bestCovered.includes(s));
                } else {
                    break;
                }
            }

            slots.push({
                role: "Consultant",
                department: deptName,
                members: slotMembers,
                missingSkills: remainingSkills,
                hours: d.hours_required || 0
            });
        }
        return slots;
    }

    const template = PROJECT_TEMPLATES.find(t => t.id === project.template_id);
    if (!template) return [];

    for (const deptReq of template.departments) {
        if ((deptReq.hours || 0) <= 0) continue;
        let remainingSkills = [...deptReq.requiredSkills];
        const slotMembers: TeamSlot["members"] = [];

        while (remainingSkills.length > 0) {
            let bestCandidate: User | null = null;
            let bestCovered: string[] = [];
            let bestScore = -1;

            const candidates = users.filter(u => !globalUsedUserIds.has(u.id));

            for (const u of candidates) {
                const inDept = userDepts.some(pd => pd.user === u.id && pd.expand?.department?.name === deptReq.name);
                if (!inDept) continue;

                const mySkills = userSkills.filter(ps => ps.user === u.id).map(ps => (ps.expand?.skill as Skill)?.name);
                const matchedForThisSlot = remainingSkills.filter(s => mySkills.includes(s));
                
                if (matchedForThisSlot.length === 0) continue;

                let score = (matchedForThisSlot.length / deptReq.requiredSkills.length) * 100;
                const avail = availRecords.find(a => a.user === u.id);
                if (avail && avail.status === 'busy') score *= 0.5;

                if (score > bestScore) {
                    bestScore = score;
                    bestCandidate = u;
                    bestCovered = matchedForThisSlot;
                }
            }

            if (bestCandidate) {
                const avail = availRecords.find(a => a.user === bestCandidate!.id);
                globalUsedUserIds.add(bestCandidate.id);
                const primaryDept = userDepts.filter(pd => pd.user === bestCandidate!.id).find(pd => pd.is_primary) || userDepts.find(pd => pd.user === bestCandidate!.id);
                slotMembers.push({
                    consultant: {
                        id: bestCandidate.id,
                        first_name: bestCandidate.first_name,
                        last_name: bestCandidate.last_name,
                        display_name: bestCandidate.display_name || `${bestCandidate.first_name} ${bestCandidate.last_name}`,
                        email: bestCandidate.email,
                        title: bestCandidate.title || null,
                        bio: null, phone: null, location: null, linkedin_url: null, github_url: null, portfolio_url: null,
                        created_at: bestCandidate.created, updated_at: bestCandidate.updated,
                        availability_status: (avail?.status as any) || "available",
                        experience_years: null,
                        primary_department: (primaryDept?.expand?.department as Department)?.name || deptReq.name
                    },
                    coveredSkills: bestCovered,
                    matchScore: Math.round(bestScore)
                });
                remainingSkills = remainingSkills.filter(s => !bestCovered.includes(s));
            } else {
                break;
            }
        }

        slots.push({
            role: deptReq.role,
            department: deptReq.name,
            members: slotMembers,
            missingSkills: remainingSkills,
            hours: deptReq.hours
        });
    }

    return slots;
}
