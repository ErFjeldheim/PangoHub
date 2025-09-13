'use server'

import { createClient } from "@/lib/supabase/server";

export async function searchConsultants(query: string) {
  const supabase = await createClient();

  if (!query) {
    const { data, error } = await supabase.from('v_profiles_with_email').select('*');
    if (error) {
      console.error('Error fetching all consultants:', error);
      return [];
    }
    return data;
  }

  const { data, error } = await supabase
    .from('consultant_search')
    .select('id')
    .textSearch('doc', query, { type: 'websearch' });

  if (error) {
    console.error('Error searching consultants:', error);
    return [];
  }

  const profileIds = data.map((d) => d.id);

  const { data: profiles, error: profilesError } = await supabase
    .from('v_profiles_with_email')
    .select('*')
    .in('id', profileIds);

  if (profilesError) {
    console.error('Error fetching searched profiles:', profilesError);
    return [];
  }

  return profiles;
}
