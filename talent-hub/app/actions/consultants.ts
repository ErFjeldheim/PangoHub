// app/actions/consultants.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Database } from "@/types/supabase"; // <- your generated file
import type {
  Consultant,
  Skill,
  Experience as ExperienceRow,
  Education as EducationRow,
  AvailabilityStatus,
} from "@/types/consultant";

type VConsultantOverviewRow =
  Database["public"]["Views"]["v_consultant_overview"]["Row"];
type VProfilesWithEmailRow =
  Database["public"]["Views"]["v_profiles_with_email"]["Row"];
type VProfilesWithDeptRow =
  Database["public"]["Views"]["v_profiles_with_department"]["Row"];

type ProfileSkillsRow =
  Database["public"]["Tables"]["profile_skills"]["Row"] & {
    skills: { name: string }[] | { name: string } | null;
  };
type ExperiencesRow = Database["public"]["Tables"]["experiences"]["Row"];
type EducationsRow = Database["public"]["Tables"]["educations"]["Row"];

type DeptRPCArgs =
  Database["public"]["Functions"]["get_consultants_for_department"]["Args"];
type DeptRPCReturn =
  Database["public"]["Functions"]["get_consultants_for_department"]["Returns"];

type SearchReturns =
  Database["public"]["Functions"]["search_consultants"]["Returns"];
type SearchArgs = Database["public"]["Functions"]["search_consultants"]["Args"];

type ExperiencesRowWithLegacy = ExperiencesRow & {
  company?: string | null; // legacy fallback for org
  category?: string | null; // legacy fallback for type
};

type EducationsRowWithLegacy = EducationsRow & {
  school?: string | null; // legacy fallback for institution
  degree?: string | null; // legacy fallback for degree_level
};

function toAvailabilityStatus(
  v: string | null | undefined
): AvailabilityStatus | null {
  if (
    v === "available" ||
    v === "partly" ||
    v === "busy" ||
    v === "unavailable"
  )
    return v;
  return null;
}

function mapOverviewRowToConsultant(
  r: VConsultantOverviewRow,
  extras?: { email?: string | null; primary_department?: string | null }
): Consultant | null {
  if (!r.id || !r.first_name || !r.last_name || !r.display_name) return null; // guard required
  return {
    id: r.id,
    first_name: r.first_name,
    last_name: r.last_name,
    title: r.title ?? null,
    bio: r.bio ?? null,
    phone: r.phone ?? null,
    location: r.location ?? null,
    linkedin_url: r.linkedin_url ?? null,
    github_url: r.github_url ?? null,
    portfolio_url: r.portfolio_url ?? null,
    created_at: r.created_at ?? new Date(0).toISOString(),
    updated_at: r.updated_at ?? new Date(0).toISOString(),
    display_name: r.display_name,
    email: extras?.email ?? null,
    availability_status: toAvailabilityStatus(r.availability_status),
    experience_years: r.experience_years ?? null,
    primary_department: extras?.primary_department ?? null,
  };
}

/** Search consultants. If query empty => return all overview rows. */
export async function searchConsultants(query: string): Promise<Consultant[]> {
  const supabase = await createClient();

  if (!query?.trim()) {
    // no search term: list all
    const { data, error } = await supabase
      .from("v_consultant_overview")
      .select("*")
      .order("display_name", { ascending: true });
    if (error) {
      console.error(error);
      return [];
    }
    return (data ?? [])
      .map((r) =>
        mapOverviewRowToConsultant(r as VConsultantOverviewRow, {
          email: null,
          primary_department: null,
        })
      )
      .filter((x): x is Consultant => x !== null);
  }

  // use RPC (typed by codegen)
  const args = { q: query, p_limit: 50, p_offset: 0 } satisfies SearchArgs;
  const { data, error } = await supabase.rpc("search_consultants", args);
  if (error) {
    console.error(error);
    return [];
  }

  const results = (data ?? []) as SearchReturns;

  // We only get a subset from the RPC; pull full rows for those ids
  const ids = results.map((r) => r.id);
  if (!ids.length) return [];

  const { data: rows, error: rowsErr } = await supabase
    .from("v_consultant_overview")
    .select("*")
    .in("id", ids);

  if (rowsErr) {
    console.error(rowsErr);
    return [];
  }

  return (rows ?? [])
    .map((r) =>
      mapOverviewRowToConsultant(r as VConsultantOverviewRow, {
        email: null,
        primary_department: null,
      })
    )
    .filter((x): x is Consultant => x !== null);
}

/** Single consultant merged from three views. */
export async function getConsultant(consultantId: string): Promise<Consultant> {
  const supabase = await createClient();

  const [emailView, overviewView, deptView] = await Promise.all([
    supabase
      .from("v_profiles_with_email")
      .select("*")
      .eq("id", consultantId)
      .single(),
    supabase
      .from("v_consultant_overview")
      .select("*")
      .eq("id", consultantId)
      .single(),
    supabase
      .from("v_profiles_with_department")
      .select("*")
      .eq("id", consultantId)
      .single(),
  ]);

  if (overviewView.error || !overviewView.data) notFound();

  const ov = overviewView.data as VConsultantOverviewRow;
  const em = emailView.data as VProfilesWithEmailRow | null;
  const dp = deptView.data as VProfilesWithDeptRow | null;

  const merged = mapOverviewRowToConsultant(ov, {
    email: em?.email ?? null,
    primary_department: dp?.primary_department ?? null,
  });

  if (!merged) notFound();
  return merged;
}

/** Department list (typed by RPC). */
export async function getConsultantsForDepartment(departmentId: string) {
  const supabase = await createClient();
  const args = { p_department_id: departmentId } satisfies DeptRPCArgs;

  const { data, error } = await supabase.rpc(
    "get_consultants_for_department",
    args
  );
  if (error) {
    console.error(error);
    return [] as DeptRPCReturn;
  }
  return (data ?? []) as DeptRPCReturn;
}

/** Skills -> normalize `skills(name)` possibly array/object/null. */
export async function getSkills(consultantId: string): Promise<Skill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_skills")
    .select("proficiency, years, skills(name)")
    .eq("profile_id", consultantId)
    .order("proficiency", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  const rows = (data ?? []) as ProfileSkillsRow[];
  return rows.map<Skill>((r) => {
    const s = Array.isArray(r.skills) ? r.skills[0] : r.skills;
    return {
      proficiency: Number(r.proficiency),
      years: r.years ?? 0,
      skills: { name: s?.name ?? "" },
    };
  });
}

/** Experiences (map 1:1 assuming your new schema names). */
export async function getExperiences(
  consultantId: string
): Promise<ExperienceRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experiences")
    .select("*")
    .eq("profile_id", consultantId)
    .order("start_date", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  const rows = (data ?? []) as ExperiencesRow[];

  return rows.map<ExperienceRow>((r) => {
    const row = r as ExperiencesRowWithLegacy;
    return {
      id: r.id,
      profile_id: r.profile_id,
      org: (r as ExperiencesRow).org ?? row.company ?? "",
      role: r.role ?? "",
      start_date: r.start_date,
      end_date: r.end_date ?? null,
      type: (r as ExperiencesRow).type ?? row.category ?? "",
      description: r.description ?? null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  });
}

/** Educations (map 1:1 with fallbacks). */
export async function getEducations(
  consultantId: string
): Promise<EducationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("educations")
    .select("*")
    .eq("profile_id", consultantId)
    .order("end_year", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  const rows = (data ?? []) as EducationsRow[];

  return rows.map<EducationRow>((r) => {
    const row = r as EducationsRowWithLegacy;
    return {
      id: r.id,
      profile_id: r.profile_id,
      institution: r.institution ?? row.school ?? "",
      program: r.program ?? null,
      degree_level: r.degree_level ?? row.degree ?? null,
      start_year: r.start_year ?? null,
      end_year: r.end_year ?? null,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  });
}
