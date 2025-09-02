import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, ExternalLink, Calendar, DollarSign, Briefcase } from "lucide-react"
import Link from "next/link"

interface ConsultantDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultantDetailPage({ params }: ConsultantDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get current user profile to check permissions
  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!currentProfile) {
    redirect("/auth/login")
  }

  // Get consultant profile
  const { data: consultant, error } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (error || !consultant) {
    notFound()
  }

  // Check if user can view this profile (admin or own profile)
  if (currentProfile.role !== "admin" && currentProfile.id !== consultant.id) {
    redirect("/dashboard")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "busy":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "unavailable":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {consultant.first_name} {consultant.last_name}
          </h1>
          <p className="text-muted-foreground">{consultant.title || "Consultant"}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getStatusColor(consultant.availability_status)}>{consultant.availability_status}</Badge>
          {currentProfile.id === consultant.id && (
            <Link href="/dashboard/profile">
              <Button>Edit Profile</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Profile Card */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              {consultant.bio ? (
                <p className="text-muted-foreground leading-relaxed">{consultant.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No bio provided yet.</p>
              )}
            </CardContent>
          </Card>

          {consultant.skills && consultant.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {consultant.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${consultant.email}`} className="text-sm hover:text-primary">
                  {consultant.email}
                </a>
              </div>

              {consultant.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${consultant.phone}`} className="text-sm hover:text-primary">
                    {consultant.phone}
                  </a>
                </div>
              )}

              {consultant.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{consultant.location}</span>
                </div>
              )}

              {consultant.linkedin_url && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={consultant.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-primary"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}

              {consultant.github_url && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={consultant.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-primary"
                  >
                    GitHub Profile
                  </a>
                </div>
              )}

              {consultant.portfolio_url && (
                <div className="flex items-center space-x-3">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={consultant.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-primary"
                  >
                    Portfolio
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {consultant.department && (
                <div className="flex items-center space-x-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{consultant.department}</span>
                </div>
              )}

              {consultant.experience_years && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{consultant.experience_years} years experience</span>
                </div>
              )}

              {consultant.hourly_rate && (
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">${consultant.hourly_rate}/hour</span>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Joined {new Date(consultant.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
