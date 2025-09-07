'use server'

import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import { createHash } from 'crypto';

export async function createInvitation(email: string, role: 'consultant' | 'admin') {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const tokenHash = createHash('sha256').update(token).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const { data, error } = await supabase.from('invitations').insert({
    email,
    role,
    invited_by: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  }).select();

  if (error) {
    console.error('Error creating invitation:', error);
    throw new Error('Failed to create invitation');
  }

  // In a real app, you'd send an email here with the plain `token`
  const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup?token=${token}`;

  return {
    inviteUrl,
  };
}
