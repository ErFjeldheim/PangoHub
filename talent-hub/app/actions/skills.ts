"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import type { Skill, ProfileSkill } from "@/types/pocketbase";

export interface SkillPublic {
  id: string;
  name: string;
}

export interface ProfileSkillPublic {
  skill_id: string;
  name: string;
  proficiency: number;
}

export async function getAllSkills(): Promise<SkillPublic[]> {
  const pb = await createServerClient();
  try {
      const records = await pb.collection("skills").getFullList<Skill>({
          sort: 'name',
          fields: 'id,name'
      });
      return records.map(r => ({ id: r.id, name: r.name }));
  } catch (e: any) {
      throw new Error(e.message);
  }
}

export async function getProfileSkills(
  profileId: string
): Promise<ProfileSkillPublic[]> {
  const pb = await createServerClient();
  try {
      const records = await pb.collection("profile_skills").getFullList<ProfileSkill>({
          filter: `user="${profileId}"`,
          expand: 'skill',
      });
      
      return records.map(ps => ({
          skill_id: ps.skill,
          name: (ps.expand?.skill as Skill)?.name || "",
          proficiency: ps.proficiency || 0
      }));
  } catch (e: any) {
      throw new Error(e.message);
  }
}

export async function findSkillByName(name: string): Promise<SkillPublic | null> {
  const pb = await createServerClient();
  const trimmed = name.trim();
  if (!trimmed) return null;

  try {
      const record = await pb.collection("skills").getFirstListItem<Skill>(`name~"${trimmed}"`);
      return { id: record.id, name: record.name };
  } catch {
      return null;
  }
}

export async function addProfileSkill(params: {
  profileId: string;
  skillId: string;
  proficiency?: number;
}): Promise<ProfileSkillPublic> {
  const { profileId, skillId, proficiency = 3 } = params;
  const pb = await createServerClient();

  try {
      const record = await pb.collection("profile_skills").create<ProfileSkill>({
          user: profileId,
          skill: skillId,
          proficiency
      });
      
      const skill = await pb.collection("skills").getOne<Skill>(skillId);
      
      return {
          skill_id: record.skill,
          name: skill.name,
          proficiency: record.proficiency || 3
      };
  } catch (e: any) {
      throw new Error(e.message);
  }
}

export async function removeProfileSkill(params: {
  profileId: string;
  skillId: string;
}): Promise<void> {
  const pb = await createServerClient();
  try {
      const record = await pb.collection("profile_skills").getFirstListItem(`user="${params.profileId}" && skill="${params.skillId}"`);
      await pb.collection("profile_skills").delete(record.id);
  } catch (e: any) {
      throw new Error(e.message);
  }
}

export async function updateProfileSkillProficiency(params: {
  profileId: string;
  skillId: string;
  proficiency: number;
}): Promise<void> {
  const pb = await createServerClient();
  try {
      const record = await pb.collection("profile_skills").getFirstListItem(`user="${params.profileId}" && skill="${params.skillId}"`);
      await pb.collection("profile_skills").update(record.id, {
          proficiency: params.proficiency
      });
  } catch (e: any) {
      throw new Error(e.message);
  }
}

export async function createSkill(name: string): Promise<SkillPublic> {
  const pb = await createServerClient();
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Skill name is required");

  try {
      const record = await pb.collection("skills").create<Skill>({ name: trimmed });
      return { id: record.id, name: record.name };
  } catch (e: any) {
      throw new Error(e.message);
  }
}
