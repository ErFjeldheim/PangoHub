// app/auth/login/actions.ts
"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/pocketbase-server";
import { cookies } from "next/headers";

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

  const pb = await createServerClient();

  try {
    await pb.collection('users').authWithPassword(email, password);
    
    if (!pb.authStore.isValid) {
        return { error: "Authentication failed." };
    }

    const cookieString = pb.authStore.exportToCookie({ httpOnly: false });
    const match = cookieString.match(/pb_auth=([^;]+)/);
      
    if (match) {
        (await cookies()).set('pb_auth', match[1], {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            httpOnly: false
        });
    }
  } catch (e: any) {
    console.error("Auth signIn error:", expandError(e));
    return {
      error: e.message || "Failed to authenticate."
    };
  }

  redirect("/dashboard");
}
