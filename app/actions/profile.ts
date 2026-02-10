"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/pocketbase-server";

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

  revalidatePath("/dashboard/profile");
}
