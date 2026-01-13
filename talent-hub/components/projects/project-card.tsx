import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Users, Building2 } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    status: string;
    client_name?: string | null;
    description?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    consultant_count: number;
    departments?: string[];
  };
  href: string;
}

const statusColors = {
  planned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  on_hold:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export function ProjectCard({ project, href }: ProjectCardProps) {
  return (
    <a href={href} className="group block">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <Badge
              variant="secondary"
              className={
                statusColors[project.status as keyof typeof statusColors] || ""
              }
            >
              {project.status}
            </Badge>
          </div>
          {project.client_name && (
            <CardDescription className="flex items-center gap-1.5 mt-2">
              <Building2 className="h-3.5 w-3.5" />
              {project.client_name}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {project.description || "No description provided"}
          </p>

          <div className="flex flex-col gap-2 text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {project.start_date || "—"} → {project.end_date || "ongoing"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>
                {project.consultant_count} consultant
                {project.consultant_count === 1 ? "" : "s"}
                {project.departments?.length
                  ? ` · ${project.departments.join(", ")}`
                  : ""}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
