"use client";

// components/consultants/ConsultantEducation.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import type { Education } from "@/types/consultant";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ConsultantEducation({
  educations,
}: {
  educations: Education[];
}) {
  const { t } = useLanguage();

  return (
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl">{t.consultantProfile.educationTitle}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {educations.map((edu, index) => (
          <div key={edu.id} className="relative pl-8">
            {/* Timeline connector */}
            {index !== educations.length - 1 && (
              <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border" />
            )}

            {/* Timeline dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">
                {edu.institution}
              </h3>
              <p className="text-sm text-muted-foreground">
                {edu.program} ({edu.degree_level})
              </p>
              <p className="text-xs text-muted-foreground/80">
                {edu.start_year} - {edu.end_year}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
