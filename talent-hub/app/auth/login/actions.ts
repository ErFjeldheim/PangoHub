// app/auth/login/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function expandError(err: unknown) {
  if (!err) return null;
  const e = err as Record<string, unknown>;
  try {
    return JSON.stringify(e, Object.getOwnPropertyNames(e));
  } catch {
    return String(e);
  }
}

export async function login(
  _prevState: { error: string | null } | undefined,
  formData: FormData
) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  try {
    const pre = await supabase.from("profiles").select("id").limit(1);
    if (pre.error) {
      console.error("Preflight (anon) error:", expandError(pre.error));
      return {
        error:
          `DB preflight failed: ${pre.error.message}` +
          (pre.error.details ? ` — ${pre.error.details}` : ""),
      };
    }
  } catch (e: unknown) {
    console.error("Preflight (anon) threw:", expandError(e));
    return { error: "DB preflight threw. Check server logs." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Auth signIn error:", expandError(error));
    return {
      error:
        error.message === "Database error querying schema"
          ? "Auth failed due to a database schema/permissions issue."
          : error.message,
    };
  }

  redirect("/dashboard");
}
