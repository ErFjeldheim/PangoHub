'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("[getProfile Server Action] Error getting user:", userError);
    redirect('/auth/login');
  }

  const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (profileError) {
    console.error("[getProfile Server Action] Error getting profile:", profileError);
    redirect('/auth/login'); // Or handle this error differently, e.g., show a generic error page
  }

  if (!profile) {
    console.log("[getProfile Server Action] No profile found for user:", user.id);
    redirect('/auth/login'); // Redirect if no profile is found
  }

  const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin', { uid: user.id });

  if (isAdminError) {
    console.error("[getProfile Server Action] Error checking admin status:", isAdminError);
    // Decide if you want to redirect or just default to a non-admin role
  }

  const role = isAdmin ? 'admin' : 'consultant';

  return { user, profile: { ...profile, role } };
}