"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getAuthUserId() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  return user.id;
}

export async function updateMyProfileAction(formData: FormData) {
  const uid = await getAuthUserId();

  // Extract & sanitize inputs
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

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update(patch).eq("id", uid);

  if (error) throw new Error(error.message);

  // Revalidate profile page (tweak paths as needed)
  revalidatePath("/dashboard/profile");
}
