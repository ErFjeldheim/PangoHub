"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { createHash } from "crypto";
import { Invitation, User } from "@/types/pocketbase";

export async function createInvitation(
  email: string,
  role: "consultant" | "admin"
) {
  const pb = await createServerClient();
  const user = pb.authStore.record;
  if (!user) throw new Error("Not authenticated");

  const cleanEmail = email.trim();
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  try {
      await pb.collection("invitations").create({
          email: cleanEmail,
          role,
          invited_by: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt.toISOString()
      });
  } catch (err) {
      const e = err as Error;
      if (e.message?.includes("unique")) {
          throw new Error("That email already has a pending invitation.");
      }
      console.error("Error creating invitation:", e);
      throw new Error("Failed to create invitation");
  }

  const inviteUrl =
    `${process.env.NEXT_PUBLIC_BASE_URL}` +
    `/auth/signup?token=${encodeURIComponent(token)}` +
    `&email=${encodeURIComponent(cleanEmail)}`;

  return { inviteUrl };
}

export async function getInvitations() {
  const pb = await createServerClient();
  try {
      const records = await pb.collection("invitations").getFullList<Invitation>({
          filter: 'accepted_at=""',
          expand: 'invited_by',
          sort: '-created'
      });
      return records.map(r => ({
          ...r,
          role: (r.role as "admin" | "consultant") || "consultant",
          created_at: r.created,
          invited_by: r.expand?.invited_by ? {
              first_name: (r.expand.invited_by as User).first_name,
              last_name: (r.expand.invited_by as User).last_name
          } : null
      }));
  } catch (e) {
      console.error("Error fetching invitations:", e);
      throw new Error("Failed to fetch invitations");
  }
}

export async function deleteInvitation(id: string) {
  const pb = await createServerClient();
  try {
      await pb.collection("invitations").delete(id);
  } catch (e) {
      console.error("Error deleting invitation:", e);
      throw new Error("Failed to delete invitation");
  }
}

export async function verifyInvitation(token: string, email: string) {
  const pb = await createServerClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  
  try {
      const invitation = await pb.collection("invitations").getFirstListItem<Invitation>(
          `email="${email}" && token_hash="${tokenHash}" && accepted_at="" && expires_at > @now`
      );
      return { invitation };
  } catch {
      return { error: { message: "Invalid or expired invitation" } };
  }
}

export async function signUpWithInvitation(formData: FormData) {
  const pb = await createServerClient();

  const token = formData.get("token") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;

  if (!token) return { error: { message: "Invalid invitation token" } };

  const { invitation, error } = await verifyInvitation(token, email);
  if (error || !invitation) {
      return { error: { message: "Invalid or expired invitation" } };
  }

  let user: User;
  try {
      user = await pb.collection("users").create<User>({
          email,
          password,
          passwordConfirm: password,
          first_name: firstName,
          last_name: lastName,
          role: invitation.role || "consultant",
          emailVisibility: true,
          verified: true
      });
  } catch (err) {
      const e = err as Error;
      return { error: { message: e.message || "Signup failed" } };
  }

  try {
      await pb.collection("invitations").update(invitation.id, {
          accepted_at: new Date().toISOString()
      });
  } catch (err) {
      const e = err as Error;
      console.error("accept invitation error:", e);
      return { error: { message: "Account created, but invite acceptance failed." } };
  }

  return { user };
}
