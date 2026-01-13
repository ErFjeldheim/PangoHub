// components/consultants/ConsultantSkills.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

type DisplaySkill = {
  skills: { name: string }; // joined skill name
  proficiency?: number | null; // optional numeric
  years?: number | null; // optional numeric
};

export function ConsultantSkills({ skills }: { skills: DisplaySkill[] }) {
  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl">Skills &amp; Expertise</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => {
            const proficiency =
              typeof skill.proficiency === "number" ? skill.proficiency : null;
            const years = typeof skill.years === "number" ? skill.years : null;

            return (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1.5 text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {skill.skills.name}
                {proficiency !== null && (
                  <span className="ml-1.5 text-xs opacity-70">
                    P{proficiency}
                  </span>
                )}
                {years !== null && (
                  <span className="ml-1.5 text-xs opacity-70">{years}y</span>
                )}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
