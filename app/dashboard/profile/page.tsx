import { requireAuth, getCurrentProfile } from "@/lib/auth/server-auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { ErrorDisplay } from "@/components/error-display";
import { User, Sparkles } from "lucide-react";

export default async function ProfilePage() {
  await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <ErrorDisplay
        title="Profile not found"
        message="We couldn't find your profile. Please contact support."
      />
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20">
            <User className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-balance">
              My Profile
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Manage your consultant profile and information
            </p>
          </div>
        </div>

        {/* Profile Completion Tip */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Complete your profile to stand out
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              A complete profile helps clients find you and increases your
              chances of landing great projects.
            </p>
          </div>
        </div>
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
