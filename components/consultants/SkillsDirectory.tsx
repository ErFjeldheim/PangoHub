"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type SkillDirectoryItem = {
  id: string;
  name: string;
  consultantCount: number;
};

type SortKey = "alpha" | "count";

function sortSkills(items: SkillDirectoryItem[], sortBy: SortKey) {
  return [...items].sort((a, b) => {
    if (sortBy === "alpha") {
      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) return nameCompare;
      return b.consultantCount - a.consultantCount;
    }

    const countCompare = b.consultantCount - a.consultantCount;
    if (countCompare !== 0) return countCompare;
    return a.name.localeCompare(b.name);
  });
}

export function SkillsDirectory({ skills }: { skills: SkillDirectoryItem[] }) {
  const [sortBy, setSortBy] = useState<SortKey>("count");
  const { t } = useLanguage();

  const sortedSkills = useMemo(
    () => sortSkills(skills, sortBy),
    [skills, sortBy],
  );

  const skillsCountLabel = t.consultants.skillsFound.replace(
    "{count}",
    String(skills.length),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{skillsCountLabel}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t.consultants.orderBy}
          </span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortKey)}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder={t.consultants.orderBy} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpha">{t.consultants.orderAlpha}</SelectItem>
              <SelectItem value="count">{t.consultants.orderCount}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {t.consultants.skillsDirectory}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {sortedSkills.length ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="uppercase text-xs tracking-wide text-muted-foreground">
                    {t.consultants.columnSkill}
                  </TableHead>
                  <TableHead className="text-right uppercase text-xs tracking-wide text-muted-foreground">
                    {t.consultants.columnConsultants}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSkills.map((skill, index) => (
                  <TableRow
                    key={skill.id}
                    className={
                      index % 2 === 0 ? "bg-background" : "bg-muted/20"
                    }
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/consultants/skills/${skill.id}`}
                        className="text-primary hover:underline underline-offset-4"
                      >
                        {skill.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2.5 py-1"
                      >
                        {skill.consultantCount}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              {t.consultants.skillsEmpty}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
