// app/actions/signupWithInvite.ts
"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import type { Invitation } from "@/types/pocketbase";

export async function signupWithInvite(opts: {
  email: string;
  password: string;
  token: string;
  first_name?: string;
  last_name?: string;
}) {
  const pb = await createServerClient();

  const email = opts.email.trim();
  const token = opts.token.trim();

  let invite: Invitation;
  try {
    invite = await pb.collection('invitations').getFirstListItem<Invitation>(
      `email="${email}" && token_hash="${token}" && accepted_at="" && expires_at > @now`
    );
  } catch {
    throw new Error("Invalid or expired invitation.");
  }

  try {
    await pb.collection('users').create({
      email: email,
      password: opts.password,
      passwordConfirm: opts.password,
      first_name: opts.first_name ?? "",
      last_name: opts.last_name ?? "",
      role: invite.role || "consultant",
      emailVisibility: true,
      verified: true,
    });

    await pb.collection('invitations').update(invite.id, {
        accepted_at: new Date().toISOString(),
    });

  } catch (e: any) {
    throw new Error(e.message || "Failed to create user.");
  }

  return { ok: true };
}
