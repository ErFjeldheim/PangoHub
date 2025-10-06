import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ConsultantSkills({ skills }: { skills: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Expertise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill: any, index) => (
            <Badge key={index} variant="secondary">
              {skill.skills.name} (Proficiency: {skill.proficiency})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}