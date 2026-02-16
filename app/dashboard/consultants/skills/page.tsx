"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { getSkillsWithCounts } from "@/app/actions/skills";
import {
  SkillsDirectory,
  type SkillDirectoryItem,
} from "@/components/consultants/SkillsDirectory";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ConsultantSkillsPage() {
  const { t } = useLanguage();
  const [skills, setSkills] = useState<SkillDirectoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const data = await getSkillsWithCounts();
      setSkills(data);
      setIsLoading(false);
    };
    load();
  }, []);

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

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">{t.common.loading}</p>
          </div>
        </div>
      ) : (
        <SkillsDirectory skills={skills} />
      )}
    </div>
  );
}
