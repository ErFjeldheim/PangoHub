"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getSkillById } from "@/app/actions/skills";
import { getConsultantsBySkill } from "@/app/actions/consultants";
import { AvailabilityBadge } from "@/components/consultants/AvailabilityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { SkillPublic } from "@/app/actions/skills";

interface SkillDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { id } = use(params);
  const { t } = useLanguage();
  const [skill, setSkill] = useState<SkillPublic | null>(null);
  const [consultants, setConsultants] = useState<{
    consultant: {
      id: string;
      first_name: string;
      last_name: string;
      title: string | null;
      availability_status: string | null;
      display_name: string;
    };
    proficiency: number;
    years: number;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [skillRecord, consultantList] = await Promise.all([
        getSkillById(id),
        getConsultantsBySkill(id),
      ]);
      setSkill(skillRecord);
      setConsultants(consultantList as typeof consultants);
      setIsLoading(false);
    };
    load();
  }, [id]);

  const consultantCountLabel = useMemo(() => {
    const count = consultants.length;
    const suffix = count === 1 ? "" : "s";
    return t.consultants.skillConsultantsCount
      .replace("{count}", String(count))
      .replace("{suffix}", suffix);
  }, [consultants.length, t.consultants.skillConsultantsCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/consultants/skills">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.consultants.backToSkills}
          </Button>
        </Link>
        <div className="text-sm text-muted-foreground">
          {t.consultants.skillNotFound}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <Link href="/dashboard/consultants/skills">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t.consultants.backToSkills}
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                {skill.name}
              </h1>
            </div>
            <p className="text-muted-foreground">{consultantCountLabel}</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t.consultants.skillConsultantsTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {consultants.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.consultants.columnConsultants}</TableHead>
                  <TableHead>{t.profile.basic.jobTitle}</TableHead>
                  <TableHead>{t.consultants.columnLevel}</TableHead>
                  <TableHead>{t.consultantProfile.availabilityTitle}</TableHead>
                  <TableHead className="text-right">
                    {t.consultants.columnProfile}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultants.map((entry) => (
                  <TableRow key={entry.consultant.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/consultants/${entry.consultant.id}`}
                        className="text-primary hover:underline"
                      >
                        {entry.consultant.first_name}{" "}
                        {entry.consultant.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {entry.consultant.title || t.consultants.consultantRole}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                        P{entry.proficiency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AvailabilityBadge
                        status={
                          (entry.consultant.availability_status ?? undefined) as import("@/types/consultant").AvailabilityStatus | undefined
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/dashboard/consultants/${entry.consultant.id}`}
                      >
                        <Button variant="ghost" size="sm">
                          {t.consultants.viewProfile}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t.consultants.skillNoConsultants}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
