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

  return { user, profile };
}
