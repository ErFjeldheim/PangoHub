// app/(dashboard)/settings/page.tsx
import { requireAuth, getCurrentProfile } from "@/lib/auth/server-auth";
import { SettingsForm } from "@/components/settings-form";
import { AdminSettings } from "@/components/admin-settings";
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

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
