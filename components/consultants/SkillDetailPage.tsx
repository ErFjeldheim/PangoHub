"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
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
import type { Consultant } from "@/types/consultant";

export function SkillDetailPage({
  skillName,
  consultants,
}: {
  skillName: string;
  consultants: Consultant[];
}) {
  const { t } = useLanguage();
  const suffix = consultants.length === 1 ? "" : "s";

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
                {skillName}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {t.consultants.skillConsultantsCount
                .replace("{count}", consultants.length.toString())
                .replace("{suffix}", suffix)}
            </p>
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
                  <TableHead>{t.consultants.columnTitle}</TableHead>
                  <TableHead>{t.consultants.columnAvailability}</TableHead>
                  <TableHead className="text-right">
                    {t.consultants.columnProfile}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultants.map((consultant) => (
                  <TableRow key={consultant.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/consultants/${consultant.id}`}
                        className="text-primary hover:underline"
                      >
                        {consultant.first_name} {consultant.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {consultant.title || t.consultants.consultantRole}
                    </TableCell>
                    <TableCell>
                      <AvailabilityBadge
                        status={consultant.availability_status ?? undefined}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/consultants/${consultant.id}`}>
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
