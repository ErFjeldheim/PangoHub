import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { ErrorDisplay } from "@/components/error-display";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("v_profiles_with_email")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return (
      <ErrorDisplay
        title="Error fetching profile"
        message="There was an error fetching your profile. Please try again later."
      />
    );
  }

  if (!profile) {
    return (
      <ErrorDisplay
        title="Profile not found"
        message="We couldn't find your profile. Please contact support."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your consultant profile and information.
        </p>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
