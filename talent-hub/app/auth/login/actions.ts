// app/auth/login/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function expandError(err: unknown) {
  if (!err) return null;
  const e = err as any;
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

  // 1) Preflight: make sure anon → PostgREST works (schema/permissions issues show up here)
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
  } catch (e) {
    console.error("Preflight (anon) threw:", expandError(e));
    return { error: "DB preflight threw. Check server logs." };
  }

  // 2) Auth: this is where GoTrue talks to Postgres
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Auth signIn error:", expandError(error));
    // Surface something the user can read, but keep details in console.
    return {
      error:
        error.message === "Database error querying schema"
          ? "Auth failed due to a database schema/permissions issue."
          : error.message,
    };
  }

  // 3) Success → redirect
  redirect("/dashboard");
}
