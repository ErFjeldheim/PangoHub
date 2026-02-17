import type { Experience, User } from "@/types/pocketbase";
import type { Consultant } from "@/types/consultant";

/** Compute total years of experience from a list of experience records. */
export function computeExperienceYears(experiences: Experience[]): number | null {
  if (!experiences || experiences.length === 0) return null;
  const now = new Date();
  let totalMs = 0;
  for (const exp of experiences) {
    const start = exp.start_date ? new Date(exp.start_date) : null;
    const end = exp.end_date ? new Date(exp.end_date) : now;
    if (!start || isNaN(start.getTime())) continue;
    const ms = end.getTime() - start.getTime();
    if (ms > 0) totalMs += ms;
  }
  if (totalMs === 0) return null;
  return Math.round(totalMs / (1000 * 60 * 60 * 24 * 365.25));
}

export function mapUserToConsultant(
  u: User,
  deptName?: string,
  status?: string,
  experienceYears?: number | null,
): Consultant {
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
    availability_status: (status as any) || null,
    experience_years: experienceYears ?? null,
    primary_department: deptName || null,
  };
}
