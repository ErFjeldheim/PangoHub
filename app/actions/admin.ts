// app/actions/admin.ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/pocketbase-server";
import type { AdminUser } from "@/types/admin";
import type { Invitation } from "@/types/invitation";
import { requireAdmin } from "@/lib/auth/server-auth";
import type { User as PBUser, Invitation as PBInvitation } from "@/types/pocketbase";

function mapToAdminUser(u: PBUser): AdminUser {
    return {
        id: u.id,
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        title: u.title || "",
        bio: u.bio || "",
        phone: u.phone || "",
        location: u.location || "",
        linkedin_url: u.linkedin_url || "",
        github_url: u.github_url || "",
        portfolio_url: u.portfolio_url || "",
        created_at: u.created,
        updated_at: u.updated,
        display_name: u.display_name || "",
        email: u.email,
        is_admin: u.role === 'admin'
    }
}

export async function listUsersAndInvites(): Promise<{
  users: AdminUser[];
  invitations: Invitation[];
}> {
  await requireAdmin();
  const pb = await createServerClient();

  const usersRecords = await pb.collection("users").getFullList<PBUser>({
      sort: '-id'
  });

  const users = usersRecords.map(mapToAdminUser);

  const invitesRecords = await pb.collection("invitations").getFullList<PBInvitation>({
      filter: 'accepted_at="" && expires_at > @now',
      sort: '-created'
  });
  
  const invitations = invitesRecords.map(inv => ({
      ...inv,
      created_at: inv.created,
      // Map other fields if necessary to match Invitation type
  })) as unknown as Invitation[];

  return { users, invitations };
}

export async function setUserRoleAction(formData: FormData) {
  await requireAdmin();
  const pb = await createServerClient();

  const userId = String(formData.get("userId"));
  const newRole = String(formData.get("newRole")) as "admin" | "consultant" | "seller";

  await pb.collection("users").update(userId, {
      role: newRole
  });

  revalidatePath("/dashboard/settings");
}

export async function deleteInvitationAction(formData: FormData) {
  await requireAdmin();
  const pb = await createServerClient();

  const invitationId = String(formData.get("invitationId"));
  await pb.collection("invitations").delete(invitationId);

  revalidatePath("/dashboard/settings");
}
