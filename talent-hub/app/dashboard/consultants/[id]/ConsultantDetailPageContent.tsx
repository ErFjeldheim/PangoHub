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

type Props = {
  consultant: any;
  skills: any[];
  experiences: any[];
  educations: any[];
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
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "partly":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "busy":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "unavailable":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const fmtStatus = (s?: string | null) =>
    s ? s.slice(0, 1).toUpperCase() + s.slice(1) : "Unknown";

  const expYears =
    typeof consultant?.experience_years === "number"
      ? Math.max(0, Math.round(consultant.experience_years))
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {consultant.first_name} {consultant.last_name}
          </h1>
          <p className="text-muted-foreground">
            {consultant.title || "Consultant"}
            {expYears !== null && <> · ~{expYears} yrs experience</>}
            {consultant.primary_department && (
              <> · {consultant.primary_department}</>
            )}
            {consultant.location && <> · {consultant.location}</>}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {user?.id === consultant.id && (
            <Link href="/dashboard/profile">
              <Button>Edit Profile</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ConsultantAbout bio={consultant.bio} />
          {!!skills?.length && <ConsultantSkills skills={skills} />}
          {!!experiences?.length && (
            <ConsultantExperience experiences={experiences} />
          )}
          {!!educations?.length && (
            <ConsultantEducation educations={educations} />
          )}
        </div>

        <div className="space-y-6">
          <ConsultantAvailability availability={currentAvailability ?? null} />
          <ConsultantContact consultant={consultant} />
        </div>
      </div>
    </div>
  );
}
