import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export function ConsultantExperience({ experiences }: { experiences: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="flex space-x-4">
            <Building className="h-6 w-6 text-muted-foreground mt-1" />
            <div>
              <h3 className="font-semibold">{exp.role} at {exp.org}</h3>
              <p className="text-sm text-muted-foreground">{new Date(exp.start_date).getFullYear()} - {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Present'}</p>
              <p className="text-sm mt-1">{exp.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}