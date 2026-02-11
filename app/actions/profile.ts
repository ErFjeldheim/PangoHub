"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/pocketbase-server";
import { Experience, Education } from "@/types/pocketbase";

async function getAuthUserId() {
  const pb = await createServerClient();
  const user = pb.authStore.record;
  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function updateMyProfileAction(formData: FormData) {
  const uid = await getAuthUserId();

  const fields = [
    "first_name",
    "last_name",
    "title",
    "bio",
    "phone",
    "location",
    "linkedin_url",
    "github_url",
    "portfolio_url",
  ] as const;

  const patch: Record<string, string | null> = {};
  for (const f of fields) {
    const v = (formData.get(f) as string | null) ?? null;
    patch[f] = v && v.trim() ? v.trim() : null;
  }

  const pb = await createServerClient();
  try {
      await pb.collection("users").update(uid, patch);
  } catch (err) {
      const e = err as Error;
    throw new Error(e.message);
  }
}

export async function createEducation(data: Partial<Education>) {
  const uid = await getAuthUserId();
  const pb = await createServerClient();

  try {
    const record = await pb.collection("educations").create<Education>({
      ...data,
      user: uid,
    });
    revalidatePath("/dashboard/profile");
    return record;
  } catch (err) {
    const e = err as Error;
    console.error("createEducation error:", e);
    throw new Error(e.message);
  }
}

export async function updateEducation(id: string, data: Partial<Education>) {
  const uid = await getAuthUserId();
  const pb = await createServerClient();

  try {
    const existing = await pb.collection("educations").getOne(id);
    if (existing.user !== uid) {
      throw new Error("You do not have permission to update this education.");
    }

    const record = await pb.collection("educations").update<Education>(id, data);
    revalidatePath("/dashboard/profile");
    return record;
  } catch (err) {
    const e = err as Error;
    console.error("updateEducation error:", e);
    throw new Error(e.message);
  }
}

export async function deleteEducation(id: string) {
  const uid = await getAuthUserId();
  const pb = await createServerClient();

  try {
    const existing = await pb.collection("educations").getOne(id);
    if (existing.user !== uid) {
      throw new Error("You do not have permission to delete this education.");
    }

    await pb.collection("educations").delete(id);
    revalidatePath("/dashboard/profile");
  } catch (err) {
    const e = err as Error;
    console.error("deleteEducation error:", e);
    throw new Error(e.message);
  }
}

export async function getExperiences(profileId: string) {
  const pb = await createServerClient();
  try {
    const records = await pb.collection("experiences").getFullList<Experience>({
      filter: `user="${profileId}"`,
      sort: '-start_date'
    });
    return records;
  } catch (err) {
    console.error("getExperiences error:", err);
    return [];
  }
}

export async function getEducations(profileId: string) {
  const pb = await createServerClient();
  try {
    const records = await pb.collection("educations").getFullList<Education>({
      filter: `user="${profileId}"`,
      sort: '-end_year'
    });
    return records;
  } catch (err) {
    console.error("getEducations error:", err);
    return [];
  }
}

export async function createExperience(data: Partial<Experience>) {
  const uid = await getAuthUserId();
  const pb = await createServerClient();

  try {
    const record = await pb.collection("experiences").create<Experience>({
      ...data,
      user: uid,
    });
    revalidatePath("/dashboard/profile");
    return record;
  } catch (err) {
    const e = err as Error;
    console.error("createExperience error:", e);
    throw new Error(e.message);
  }
}

export async function updateExperience(id: string, data: Partial<Experience>) {
  const uid = await getAuthUserId();
  const pb = await createServerClient();

  try {
    const existing = await pb.collection("experiences").getOne(id);
    if (existing.user !== uid) {
      throw new Error("You do not have permission to update this experience.");
    }

    const record = await pb.collection("experiences").update<Experience>(id, data);
    revalidatePath("/dashboard/profile");
    return record;
  } catch (err) {
    const e = err as Error;
    console.error("updateExperience error:", e);
    throw new Error(e.message);
  }
}

export async function deleteExperience(id: string) {
  const uid = await getAuthUserId();
  const pb = await createServerClient();

  try {
    const existing = await pb.collection("experiences").getOne(id);
    if (existing.user !== uid) {
      throw new Error("You do not have permission to delete this experience.");
    }

    await pb.collection("experiences").delete(id);
    revalidatePath("/dashboard/profile");
  } catch (err) {
    const e = err as Error;
    console.error("deleteExperience error:", e);
    throw new Error(e.message);
  }
}
