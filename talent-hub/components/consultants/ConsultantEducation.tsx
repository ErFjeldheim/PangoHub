import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

export function ConsultantEducation({ educations }: { educations: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {educations.map((edu) => (
          <div key={edu.id} className="flex space-x-4">
            <GraduationCap className="h-6 w-6 text-muted-foreground mt-1" />
            <div>
              <h3 className="font-semibold">{edu.institution}</h3>
              <p className="text-sm text-muted-foreground">{edu.program} ({edu.degree_level})</p>
              <p className="text-sm text-muted-foreground">{edu.start_year} - {edu.end_year}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}