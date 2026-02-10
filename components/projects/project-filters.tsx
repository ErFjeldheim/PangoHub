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
  return (
    <form className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[280px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={searchParams?.q ?? ""}
          placeholder="Search projects..."
          className="pl-9"
        />
      </div>

      <Select name="status" defaultValue={searchParams?.status ?? "all"}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="planned">Planned</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="on_hold">On Hold</SelectItem>
        </SelectContent>
      </Select>

      <Select name="dep" defaultValue={searchParams?.dep ?? "all"}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="All departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All departments</SelectItem>
          {departments?.map((d) => (
            <SelectItem key={d.id} value={d.name}>
              {d.name} ({d.consultant_count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="submit">Apply Filters</Button>
    </form>
  );
}
