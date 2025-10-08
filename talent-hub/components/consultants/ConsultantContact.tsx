import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, Linkedin, Github, Globe } from "lucide-react";

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
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Mail className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl">Contact</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {consultant.email && (
          <a
            href={`mailto:${consultant.email}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Mail className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
              {consultant.email}
            </span>
          </a>
        )}

        {consultant.phone && (
          <a
            href={`tel:${consultant.phone}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Phone className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm text-foreground group-hover:text-primary transition-colors">
              {consultant.phone}
            </span>
          </a>
        )}

        {consultant.location && (
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="p-1.5 rounded-md bg-muted">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              {consultant.location}
            </span>
          </div>
        )}

        {(linkedin || github || portfolio) && (
          <div className="pt-2 border-t space-y-2">
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Linkedin className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  LinkedIn Profile
                </span>
              </a>
            )}

            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Github className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  GitHub Profile
                </span>
              </a>
            )}

            {portfolio && (
              <a
                href={portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  Portfolio
                </span>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
