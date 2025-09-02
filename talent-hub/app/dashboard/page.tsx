import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Clock, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile to check role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Get dashboard stats
  const { data: consultants } = await supabase.from("profiles").select("*").eq("role", "consultant")

  const { data: pendingInvitations } = await supabase
    .from("invitations")
    .select("*")
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())

  const availableConsultants = consultants?.filter((c) => c.availability_status === "available").length || 0
  const totalConsultants = consultants?.length || 0
  const pendingInvites = pendingInvitations?.length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.first_name}</h1>
        <p className="text-muted-foreground">Here's what's happening with your consultant network today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultants}</div>
            <p className="text-xs text-muted-foreground">Active consultant profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableConsultants}</div>
            <p className="text-xs text-muted-foreground">Ready for new projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvites}</div>
            <p className="text-xs text-muted-foreground">Awaiting responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Experience</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consultants && consultants.length > 0
                ? Math.round(consultants.reduce((acc, c) => acc + (c.experience_years || 0), 0) / consultants.length)
                : 0}
              y
            </div>
            <p className="text-xs text-muted-foreground">Years of experience</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Consultants</CardTitle>
            <CardDescription>Latest additions to your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {consultants?.slice(0, 5).map((consultant) => (
                <div key={consultant.id} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {consultant.first_name?.[0]}
                      {consultant.last_name?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {consultant.first_name} {consultant.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{consultant.title || "Consultant"}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{consultant.availability_status}</div>
                </div>
              ))}
              {(!consultants || consultants.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No consultants yet. Start by inviting some!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Invitations waiting for responses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvitations?.slice(0, 5).map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {invitation.role} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              ))}
              {(!pendingInvitations || pendingInvitations.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No pending invitations</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
