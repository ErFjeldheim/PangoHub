import { requireAuth, getCurrentProfile } from "@/lib/auth"
import { SettingsForm } from "@/components/settings-form"
import { AdminSettings } from "@/components/admin-settings"

export default async function SettingsPage() {
  await requireAuth()
  const profile = await getCurrentProfile()

  if (!profile) {
    return <div>Profile not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <SettingsForm profile={profile} />

      {profile.role === "admin" && <AdminSettings />}
    </div>
  )
}
