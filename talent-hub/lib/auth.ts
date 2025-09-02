import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function getCurrentProfile() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return profile
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }
  return user
}

export async function requireAdmin() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }
  return profile
}

export async function requireRole(role: "admin" | "consultant") {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== role) {
    redirect("/dashboard")
  }
  return profile
}
