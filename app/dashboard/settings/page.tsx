// app/(dashboard)/settings/page.tsx
import { requireAuth, getCurrentProfile } from "@/lib/auth/server-auth";
import { SettingsForm } from "@/components/settings-form";
import { AdminSettings } from "@/components/admin-settings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import {
  listUsersAndInvites,
  setUserRoleAction,
  deleteInvitationAction,
} from "@/app/actions/admin";

export default async function SettingsPage() {
  await requireAuth();
  const profile = await getCurrentProfile();
  if (!profile) return <div>Profile not found</div>;

  const adminData = profile.is_admin ? await listUsersAndInvites() : null;

  return (
    <div className="space-y-6">
      <SettingsHeader />

      <SettingsForm profile={profile} />

      {profile.is_admin && adminData && (
        <AdminSettings
          initialUsers={adminData.users}
          initialInvitations={adminData.invitations}
          setUserRoleAction={setUserRoleAction}
          deleteInvitationAction={deleteInvitationAction}
        />
      )}
    </div>
  );
}
