"use client";

import { Button } from "@/components/ui/button";
import { Mail, Phone, Linkedin } from "lucide-react";

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
    <div className="flex gap-2">
      {email && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors bg-transparent"
          asChild
        >
          <a href={`mailto:${email}`} title="Send email">
            <Mail className="h-4 w-4" />
          </a>
        </Button>
      )}
      {phone && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors bg-transparent"
          asChild
        >
          <a href={`tel:${phone}`} title="Call phone">
            <Phone className="h-4 w-4" />
          </a>
        </Button>
      )}
      {linkedin_url && (
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-colors bg-transparent"
          asChild
        >
          <a
            href={linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            title="View LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </Button>
      )}
    </div>
  );
}
