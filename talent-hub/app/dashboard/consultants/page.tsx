"use client"

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { ConsultantSearch } from '@/components/ConsultantSearch';
import { searchConsultants } from '@/lib/actions/consultants';

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConsultants = async () => {
      setIsLoading(true);
      const initialConsultants = await searchConsultants('');
      setConsultants(initialConsultants);
      setIsLoading(false);
    };
    fetchConsultants();
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const searchResults = await searchConsultants(query);
    setConsultants(searchResults);
    setIsLoading(false);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Consultants</h1>
          <p className="text-muted-foreground">Manage your consultant network</p>
        </div>
        <Link href="/dashboard/invite">
          <Button>Invite Consultant</Button>
        </Link>
      </div>

      <ConsultantSearch onSearch={handleSearch} />

      {isLoading ? (
        <p>Loading...</p>
      ) : (
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
                  {/* We will add availability status later */}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {consultant.bio && <p className="text-sm text-muted-foreground line-clamp-3">{consultant.bio}</p>}

                {/* We will add skills later */}

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
      )}

      {!isLoading && (!consultants || consultants.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No consultants found</h3>
                <p className="text-muted-foreground">Try a different search or invite new consultants.</p>
              </div>
              <Link href="/dashboard/invite">
                <Button>Invite a Consultant</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
