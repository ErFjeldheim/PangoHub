import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export function ConsultantContact({ consultant }: { consultant: any }) {
  return (
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
  );
}