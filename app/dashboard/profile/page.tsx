
import { requireAuth, getCurrentProfile } from "@/lib/auth/server-auth";
import { ProfileForm } from "@/components/profile/profile-form";
import { ErrorDisplay } from "@/components/error-display";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { getAvailabilityNextSixMonths, upsertAvailabilityMonthAndNotesAction } from "@/app/actions/availability";
import { AvailabilityManagerClient } from "@/components/availability/AvailabilityManagerClient";
import { getExperiences, getEducations } from "@/app/actions/profile";

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

  // Fetch all data in parallel
  const [availability, experiences, educations] = await Promise.all([
    getAvailabilityNextSixMonths(profile.id),
    getExperiences(profile.id),
    getEducations(profile.id)
  ]);

  const availabilityContent = (
    <AvailabilityManagerClient
      profileId={profile.id}
      initial={availability}
      saveMonthAction={upsertAvailabilityMonthAndNotesAction}
    />
  );

  return (
    <div className="space-y-8 pb-12">
      <ProfileHeader />
      <ProfileForm 
        profile={profile} 
        availabilityContent={availabilityContent}
        initialExperiences={experiences}
        initialEducations={educations}
      />
    </div>
  );
}
