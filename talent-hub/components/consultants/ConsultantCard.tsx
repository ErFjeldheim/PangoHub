"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultantContactButtons } from "./ConsultantContactButtons";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { Consultant } from "@/types/consultant";

export function ConsultantCard({ consultant }: { consultant: Consultant }) {
  const initials = `${consultant.first_name?.[0] ?? ""}${
    consultant.last_name?.[0] ?? ""
  }`;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/40 hover:border-primary/20 overflow-hidden">
      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
              <span className="text-lg font-semibold text-primary">
                {initials}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {consultant.first_name} {consultant.last_name}
              </CardTitle>
              <CardDescription className="text-sm">
                {consultant.title || "Consultant"}
              </CardDescription>
            </div>
          </div>
          <AvailabilityBadge
            status={consultant.availability_status ?? undefined}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {consultant.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {consultant.bio}
          </p>
        )}

        {consultant.location && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{consultant.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <ConsultantContactButtons
            email={consultant.email}
            phone={consultant.phone}
            linkedin_url={consultant.linkedin_url}
          />

          <Link href={`/dashboard/consultants/${consultant.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 group-hover:gap-2 transition-all"
            >
              View Profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
