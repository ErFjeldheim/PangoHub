"use client";

import { User, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ProfileHeader() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-card border shadow-sm">
          <User className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-balance">
            {t.profile.title}
          </h1>
          <p className="text-muted-foreground text-lg mt-1">
            {t.profile.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
        <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            {t.profile.completionTip}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {t.profile.completionDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
