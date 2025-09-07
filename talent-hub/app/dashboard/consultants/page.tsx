import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function ConsultantsPage() {
  const supabase = await createClient()

  const { data: consultants } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "consultant")
    .order("created_at", { ascending: false })

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
          <h1 className="text-3xl font-bold tracking-tight">Consultants</h1>
          <p className="text-muted-foreground">Manage your consultant network</p>
        </div>
        <Link href="/dashboard/invite">
          <Button>Invite Consultant</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {consultants?.map((consultant) => (
          <Card key={consultant.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {consultant.first_name?.[0]}
                      {consultant.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {consultant.first_name} {consultant.last_name}
                    </CardTitle>
                    <CardDescription>{consultant.title || "Consultant"}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(consultant.availability_status)}>
                  {consultant.availability_status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {consultant.bio && <p className="text-sm text-muted-foreground line-clamp-3">{consultant.bio}</p>}

              <div className="space-y-2">
                {consultant.department && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium">Department:</span>
                    <span className="ml-2">{consultant.department}</span>
                  </div>
                )}

                {consultant.experience_years && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium">Experience:</span>
                    <span className="ml-2">{consultant.experience_years} years</span>
                  </div>
                )}

                {consultant.hourly_rate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium">Rate:</span>
                    <span className="ml-2">${consultant.hourly_rate}/hour</span>
                  </div>
                )}
              </div>

              {consultant.skills && consultant.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {consultant.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {consultant.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{consultant.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  {consultant.email && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`mailto:${consultant.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {consultant.phone && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`tel:${consultant.phone}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {consultant.linkedin_url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={consultant.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <Link href={`/dashboard/consultants/${consultant.id}`}>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
              </div>

              {consultant.location && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {consultant.location}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!consultants || consultants.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No consultants yet</h3>
                <p className="text-muted-foreground">Start building your network by inviting consultants to join.</p>
              </div>
              <Link href="/dashboard/invite">
                <Button>Send First Invitation</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
