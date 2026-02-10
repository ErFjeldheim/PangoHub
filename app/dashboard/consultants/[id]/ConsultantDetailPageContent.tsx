"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ConsultantAbout } from "@/components/consultants/ConsultantAbout";
import { ConsultantSkills } from "@/components/consultants/ConsultantSkills";
import { ConsultantExperience } from "@/components/consultants/ConsultantExperience";
import { ConsultantEducation } from "@/components/consultants/ConsultantEducation";
import { ConsultantContact } from "@/components/consultants/ConsultantContact";
import { ConsultantAvailability } from "@/components/consultants/ConsultantAvailability";
import type { Availability } from "@/components/consultants/ConsultantAvailability";
import { Pencil, Briefcase, MapPin, Calendar } from "lucide-react";

import { Consultant, Skill, Experience, Education } from "@/types/consultant";

type Props = {
  consultant: Consultant;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
  currentAvailability?: Availability | null;
  user?: { id: string } | null;
};

export function ConsultantDetailPageContent({
  consultant,
  skills,
  experiences,
  educations,
  currentAvailability,
  user,
}: Props) {
  const status =
    currentAvailability?.status ?? consultant?.availability_status ?? null;

  const getStatusColor = (s?: string | null) => {
    switch (s) {
      case "available":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "partly":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "busy":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "unavailable":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const fmtStatus = (s?: string | null) =>
    s ? s.slice(0, 1).toUpperCase() + s.slice(1) : "Unknown";

  const expYears =
    typeof consultant?.experience_years === "number"
      ? Math.max(0, Math.round(consultant.experience_years))
      : null;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 via-background to-background p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-4 ring-primary/10 flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {consultant.first_name?.[0]}
                {consultant.last_name?.[0]}
              </span>
            </div>

            {/* Info */}
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-balance">
                  {consultant.first_name} {consultant.last_name}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground">
                  {consultant.title && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span className="text-sm">{consultant.title}</span>
                    </div>
                  )}
                  {expYears !== null && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="text-sm">
                          ~{expYears} yrs experience
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-muted-foreground">
                  {consultant.primary_department && (
                    <Badge variant="secondary" className="text-xs">
                      {consultant.primary_department}
                    </Badge>
                  )}
                  {consultant.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-sm">{consultant.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {status && (
                <Badge className={`${getStatusColor(status)} w-fit`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
                  {fmtStatus(status)}
                </Badge>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {user?.id === consultant.id && (
            <Link href="/dashboard/profile">
              <Button className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <ConsultantAbout bio={consultant.bio} />
          {!!skills?.length && <ConsultantSkills skills={skills} />}
          {!!experiences?.length && (
            <ConsultantExperience experiences={experiences} />
          )}
          {!!educations?.length && (
            <ConsultantEducation educations={educations} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ConsultantAvailability availability={currentAvailability ?? null} />
          <ConsultantContact consultant={consultant} />
        </div>
      </div>
    </div>
  );
}
