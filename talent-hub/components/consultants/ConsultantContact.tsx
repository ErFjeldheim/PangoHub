// components/consultants/ConsultantContact.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

function ensureUrl(u?: string | null) {
  if (!u) return null;
  try {
    const hasScheme = /^https?:\/\//i.test(u);
    return hasScheme ? u : `https://${u}`;
  } catch {
    return null;
  }
}

export function ConsultantContact({ consultant }: { consultant: any }) {
  const linkedin = ensureUrl(consultant.linkedin_url);
  const github = ensureUrl(consultant.github_url);
  const portfolio = ensureUrl(consultant.portfolio_url);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {consultant.email && (
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a
              href={`mailto:${consultant.email}`}
              className="text-sm hover:text-primary"
            >
              {consultant.email}
            </a>
          </div>
        )}

        {consultant.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`tel:${consultant.phone}`}
              className="text-sm hover:text-primary"
            >
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

        {linkedin && (
          <div className="flex items-center space-x-3">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-primary"
            >
              LinkedIn Profile
            </a>
          </div>
        )}

        {github && (
          <div className="flex items-center space-x-3">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-primary"
            >
              GitHub Profile
            </a>
          </div>
        )}

        {portfolio && (
          <div className="flex items-center space-x-3">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <a
              href={portfolio}
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
  );
}
