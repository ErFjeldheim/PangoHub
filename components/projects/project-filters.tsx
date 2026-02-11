"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ProjectFiltersProps {
  searchParams?: {
    q?: string;
    status?: string;
    dep?: string;
  };
  departments?: Array<{
    id: string;
    name: string;
    consultant_count: number;
  }> | null;
}

export function ProjectFilters({
  searchParams,
  departments,
}: ProjectFiltersProps) {
  const { t } = useLanguage();

  return (
    <form className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={searchParams?.q ?? ""}
          placeholder={t.projects.searchPlaceholder}
          className="pl-9 bg-card"
        />
      </div>

      <Select name="status" defaultValue={searchParams?.status ?? "all"}>
        <SelectTrigger className="w-[180px] bg-card">
          <SelectValue placeholder={t.projects.allStatuses} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.projects.allStatuses}</SelectItem>
          <SelectItem value="planned">{t.projects.status.planned}</SelectItem>
          <SelectItem value="active">{t.projects.status.active}</SelectItem>
          <SelectItem value="completed">{t.projects.status.completed}</SelectItem>
          <SelectItem value="on_hold">{t.projects.status.on_hold}</SelectItem>
        </SelectContent>
      </Select>

      <Select name="dep" defaultValue={searchParams?.dep ?? "all"}>
        <SelectTrigger className="w-[220px] bg-card">
          <SelectValue placeholder={t.projects.allDepartments} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t.projects.allDepartments}</SelectItem>
          {departments?.map((d) => (
            <SelectItem key={d.id} value={d.name}>
              {d.name} ({d.consultant_count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit">{t.common.apply}</Button>
    </form>
  );
}
