import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, TrendingUp, Clock } from "lucide-react"

export default async function AnalyticsPage() {
  await requireAdmin()
  const supabase = await createClient()

  // Get analytics data
  const { data: consultants } = await supabase.from("profiles").select("*").eq("role", "consultant")
  const { data: invitations } = await supabase.from("invitations").select("*")

  const totalConsultants = consultants?.length || 0
  const availableConsultants = consultants?.filter((c) => c.availability_status === "available").length || 0
  const totalInvitations = invitations?.length || 0
  const acceptedInvitations = invitations?.filter((i) => i.accepted_at).length || 0

  const departmentStats = consultants?.reduce(
    (acc, consultant) => {
      const dept = consultant.department || "Unspecified"
      acc[dept] = (acc[dept] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const skillStats = consultants?.reduce(
    (acc, consultant) => {
      consultant.skills?.forEach((skill: string) => {
        acc[skill] = (acc[skill] || 0) + 1
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const topSkills = Object.entries(skillStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const topDepartments = Object.entries(departmentStats || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Insights into your consultant network</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableConsultants}</div>
            <p className="text-xs text-muted-foreground">
              {totalConsultants > 0 ? Math.round((availableConsultants / totalConsultants) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitations Sent</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvitations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalInvitations > 0 ? Math.round((acceptedInvitations / totalInvitations) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{acceptedInvitations} accepted</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Top Skills</CardTitle>
            <CardDescription>Most common skills in your network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSkills.map(([skill, count]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{skill}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...topSkills.map(([, c]) => c))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
              {topSkills.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No skills data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Consultants by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topDepartments.map(([department, count]) => (
                <div key={department} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{department}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{
                          width: `${(count / Math.max(...topDepartments.map(([, c]) => c))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
              {topDepartments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No department data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
