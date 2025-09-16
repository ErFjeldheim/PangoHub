"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultantContactButtons } from "./ConsultantContactButtons";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { Consultant } from "@/types/consultant";

export function ConsultantCard({ consultant }: { consultant: Consultant }) {
  const initials = `${consultant.first_name?.[0] ?? ""}${
    consultant.last_name?.[0] ?? ""
  }`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-medium text-primary">
                {initials}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg">
                {consultant.first_name} {consultant.last_name}
              </CardTitle>
              <CardDescription>
                {consultant.title || "Consultant"}
              </CardDescription>
            </div>
          </div>
          <AvailabilityBadge status={consultant.status ?? undefined} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {consultant.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {consultant.bio}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <ConsultantContactButtons
            email={consultant.email}
            phone={consultant.phone}
            linkedin_url={consultant.linkedin_url}
          />

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
  );
}
