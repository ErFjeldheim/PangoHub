"use client";

import { BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  SkillsDirectory,
  type SkillDirectoryItem,
} from "@/components/consultants/SkillsDirectory";

export function SkillsDirectoryPage({
  skills,
}: {
  skills: SkillDirectoryItem[];
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t.consultants.skillsTitle}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t.consultants.skillsSubtitle}
          </p>
        </div>
      </div>

      <SkillsDirectory skills={skills} />
    </div>
  );
}
