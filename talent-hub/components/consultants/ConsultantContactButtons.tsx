"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, ExternalLink } from "lucide-react";

type Props = {
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
};

export function ConsultantContactButtons({
  email,
  phone,
  linkedin_url,
}: Props) {
  return (
    <div className="flex space-x-2">
      {email && (
        <Button variant="ghost" size="sm" asChild>
          <a href={`mailto:${email}`}>
            <Mail className="h-4 w-4" />
          </a>
        </Button>
      )}
      {phone && (
        <Button variant="ghost" size="sm" asChild>
          <a href={`tel:${phone}`}>
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      )}
      {linkedin_url && (
        <Button variant="ghost" size="sm" asChild>
          <a href={linkedin_url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
