"use server";

import { createClient } from "@/lib/supabase/server";

export interface Skill {
  id: string;
  name: string;
}

export interface ProfileSkill {
  skill_id: string;
  name: string;
  proficiency: number;
}

/** Get full list of canonical skills. */
export async function getAllSkills(): Promise<Skill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("skills")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Get a profile's skills with proficiency. */
export async function getProfileSkills(
  profileId: string
): Promise<ProfileSkill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile_skills")
    .select("skill_id, proficiency, skills(name)")
    .eq("profile_id", profileId);

  if (error) throw new Error(error.message);

  return (data ?? []).map((ps: { skill_id: string; proficiency: number; skills: { name: string } | { name: string }[] | null; }) => ({
    skill_id: ps.skill_id as string,
    proficiency: ps.proficiency as number,
    name: (Array.isArray(ps.skills)
      ? ps.skills[0]?.name
      : ps.skills?.name ?? "") as string,
  }));
}

/** Find a skill by exact name (case-insensitive). Returns null if not found. */
export async function findSkillByName(name: string): Promise<Skill | null> {
  const supabase = await createClient();
  const trimmed = name.trim();
  if (!trimmed) return null;

  // ilike without % acts like a case-insensitive equality check
  const { data, error } = await supabase
    .from("skills")
    .select("id, name")
    .ilike("name", trimmed)
    .limit(1);

  if (error) throw new Error(error.message);
  return data && data.length > 0 ? (data[0] as Skill) : null;
}

/** Attach a skill to the profile with a default proficiency (3). */
export async function addProfileSkill(params: {
  profileId: string;
  skillId: string;
  proficiency?: number; // default 3
}): Promise<ProfileSkill> {
  const { profileId, skillId, proficiency = 3 } = params;
  const supabase = await createClient();

  const { error } = await supabase.from("profile_skills").insert({
    profile_id: profileId,
    skill_id: skillId,
    proficiency,
  });

  if (error) throw new Error(error.message);

  const { data, error: fetchErr } = await supabase
    .from("profile_skills")
    .select("skill_id, proficiency, skills(name)")
    .eq("profile_id", profileId)
    .eq("skill_id", skillId)
    .single();

  if (fetchErr) throw new Error(fetchErr.message);

  const { data: skillRow } = await supabase
    .from("skills")
    .select("name")
    .eq("id", skillId)
    .single();
  return {
    skill_id: data.skill_id as string,
    name: skillRow?.name ?? "",
    proficiency: data.proficiency as number,
  };
}

/** Detach a skill from the profile. */
export async function removeProfileSkill(params: {
  profileId: string;
  skillId: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profile_skills")
    .delete()
    .match({ profile_id: params.profileId, skill_id: params.skillId });

  if (error) throw new Error(error.message);
}

/** Update proficiency for a profile's skill. */
export async function updateProfileSkillProficiency(params: {
  profileId: string;
  skillId: string;
  proficiency: number;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profile_skills")
    .update({ proficiency: params.proficiency })
    .match({ profile_id: params.profileId, skill_id: params.skillId });

  if (error) throw new Error(error.message);
}

/** Optional: explicit creation (kept as an opt-in path, not used by default). */
export async function createSkill(name: string): Promise<Skill> {
  const supabase = await createClient();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Skill name is required");

  const { data, error } = await supabase
    .from("skills")
    .insert({ name: trimmed })
    .select("id, name")
    .single();

  if (error) throw new Error(error.message);
  return data as Skill;
}
