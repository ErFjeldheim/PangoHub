'use server'

import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';

export async function signUpWithInvitation(formData: FormData) {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  const token = formData.get('token') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;

  if (!token) {
    return { error: { message: 'Invalid invitation token' } };
  }

  // Verify the invitation
  const { data: invitation, error: verificationError } = await supabase.rpc('verify_invitation', { p_email: email, p_token: token });

  if (verificationError || !invitation) {
    return { error: { message: 'Invalid or expired invitation' } };
  }

  // Sign up the user
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (signUpError) {
    return { error: signUpError };
  }

  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString(), accepted_with_user_id: user?.id })
    .eq('id', invitation.id);

  if (updateError) {
    // This is not a critical error, so we just log it
    console.error('Failed to mark invitation as accepted:', updateError);
  }
  
  // if the user is an admin, add them to the admin_members table
  if (invitation.role === 'admin') {
    await supabase.from('admin_members').insert({ user_id: user?.id });
  }

  return { user };
}

export async function verifyInvitation(token: string, email: string) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    const { data, error } = await supabase.rpc('verify_invitation', { p_email: email, p_token: token });

    if (error || !data) {
        return { error: { message: 'Invalid or expired invitation' } };
    }

    return { invitation: data };
}
