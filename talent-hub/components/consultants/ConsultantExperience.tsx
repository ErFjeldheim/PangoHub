import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export function ConsultantExperience({ experiences }: { experiences: any[] }) {
  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl">Work Experience</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {experiences.map((exp, index) => (
          <div key={exp.id} className="relative pl-8">
            {/* Timeline connector */}
            {index !== experiences.length - 1 && (
              <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>

            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-foreground">{exp.role}</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  {exp.org}
                </p>
              </div>
              <p className="text-xs text-muted-foreground/80">
                {new Date(exp.start_date).getFullYear()} -{" "}
                {exp.end_date
                  ? new Date(exp.end_date).getFullYear()
                  : "Present"}
              </p>
              {exp.description && (
                <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                  {exp.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
