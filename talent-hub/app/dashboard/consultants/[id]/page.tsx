import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, ExternalLink, Calendar, DollarSign, Briefcase, GraduationCap, Building } from "lucide-react"
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
  const { data: isAdmin } = await supabase.rpc('is_admin', { uid: user.id })

  // Get consultant profile
  const { data: consultant, error } = await supabase.from("v_profiles_with_email").select("*").eq("id", id).single()

  if (error || !consultant) {
    notFound()
  }

  // Check if user can view this profile (admin or own profile)
  if (!isAdmin && user.id !== consultant.id) {
    redirect("/dashboard")
  }

  const { data: skills } = await supabase
    .from('profile_skills')
    .select('proficiency, skills(name)')
    .eq('profile_id', id);

  const { data: experiences } = await supabase
    .from('experiences')
    .select('*')
    .eq('profile_id', id)
    .order('start_date', { ascending: false });

  const { data: educations } = await supabase
    .from('educations')
    .select('*')
    .eq('profile_id', id)
    .order('end_year', { ascending: false });

  const { data: availability } = await supabase
    .from('availability_months')
    .select('*')
    .eq('profile_id', id)
    .gte('month', new Date().toISOString())
    .order('month')
    .limit(1);
  
  const currentAvailability = availability?.[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "partly":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "busy":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
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
          {currentAvailability && <Badge className={getStatusColor(currentAvailability.status)}>{currentAvailability.status}</Badge>}
          {user.id === consultant.id && (
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

          {skills && skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: any, index) => (
                    <Badge key={index} variant="secondary">
                      {skill.skills.name} (Proficiency: {skill.proficiency})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {experiences && experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="flex space-x-4">
                    <Building className="h-6 w-6 text-muted-foreground mt-1" />
                    <div>
                      <h3 className="font-semibold">{exp.role} at {exp.org}</h3>
                      <p className="text-sm text-muted-foreground">{new Date(exp.start_date).getFullYear()} - {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}</p>
                      <p className="text-sm mt-1">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {educations && educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="flex space-x-4">
                    <GraduationCap className="h-6 w-6 text-muted-foreground mt-1" />
                    <div>
                      <h3 className="font-semibold">{edu.institution}</h3>
                      <p className="text-sm text-muted-foreground">{edu.program} ({edu.degree_level})</p>
                      <p className="text-sm text-muted-foreground">{edu.start_year} - {edu.end_year}</p>
                    </div>
                  </div>
                ))}
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
        </div>
      </div>
    </div>
  )
}
