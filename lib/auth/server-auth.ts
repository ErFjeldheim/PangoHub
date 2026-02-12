import { createServerClient } from "@/lib/pocketbase-server";
import { redirect } from "next/navigation";
import { User } from "@/types/pocketbase";

function mapUserToProfile(user: User) {
  return {
    ...user,
    created_at: user.created,
    updated_at: user.updated,
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    title: user.title || "",
    bio: user.bio || "",
    phone: user.phone || "",
    location: user.location || "",
    linkedin_url: user.linkedin_url || "",
    github_url: user.github_url || "",
    portfolio_url: user.portfolio_url || "",
    display_name: user.display_name || `${user.first_name} ${user.last_name}`.trim() || user.email,
    email: user.email,
    role: (user.role as "admin" | "consultant" | "seller") || "consultant",
  };
}

export async function getCurrentUser() {
  const pb = await createServerClient();
  return pb.authStore.record as User | null;
}

export async function isAdmin(uid?: string): Promise<boolean> {
  const pb = await createServerClient();
  const currentUser = pb.authStore.record as User | null;

  if (!currentUser) return false;

  if (uid && currentUser.id !== uid) {
      try {
          const user = await pb.collection('users').getOne(uid) as User;
          return user.role === 'admin';
      } catch {
          return false;
      }
  }

  return currentUser.role === 'admin';
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const profile = mapUserToProfile(user);
  const admin = user.role === 'admin';
  
  return { ...profile, is_admin: admin };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/dashboard");
}

export async function requireSalesAccess() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "admin" && user.role !== "seller" && user.role !== "consultant") redirect("/dashboard");
}

export async function requireSelf(profileId: string) {
  const user = await getCurrentUser();
  const uid = user?.id;
  if (uid !== profileId) throw new Error("Forbidden");
}
