// app/actions/consultantHome.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function getConsultantHomeData() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return null;
  const uid = auth.user.id;

  // role: only admins see org-wide dashboard
  const { data: isAdmin } = await supabase.rpc("is_admin", { uid });

  // profile + display name + primary department
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, display_name, primary_department")
    .eq("id", uid)
    .maybeSingle();

  // profile completeness (0-100)
  const { data: completeness } = await supabase
    .from("v_profile_completeness")
    .select("completeness_percentage")
    .eq("id", uid)
    .maybeSingle();

  // my availability (order by month asc)
  const { data: availability } = await supabase
    .from("v_availability_current")
    .select("month, hours_free, hours_available, hours_committed")
    .eq("profile_id", uid)
    .order("month", { ascending: true });

  // my projects (via member join)
  const { data: myProjectIds } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("profile_id", uid);

  const ids = (myProjectIds || []).map((r) => r.project_id);
  const { data: myProjects } = ids.length
    ? await supabase
        .from("v_project_overview")
        .select("id, name, client_name, departments, is_active")
        .in("id", ids)
    : { data: [] as any[] };

  // opportunities: active projects not in myProjects
  const { data: allActive } = await supabase
    .from("v_project_overview")
    .select("id, name, client_name, departments, is_active")
    .eq("is_active", true);

  const opportunities =
    (allActive || []).filter((p) => !ids.includes(p.id)) ?? [];

  return {
    isAdmin: !!isAdmin,
    displayName:
      profile?.display_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      "there",
    primaryDepartmentName: profile?.primary_department ?? null,
    completenessPct: Number(completeness?.completeness_percentage ?? 0),
    availability: availability ?? [],
    myProjects: myProjects ?? [],
    opportunities,
  };
}
