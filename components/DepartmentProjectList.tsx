"use client";

import { FC } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type ProjectStatus = "planned" | "active" | "completed" | "on_hold";

interface DepartmentProject {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  client_name: string | null;
}

interface DepartmentProjectListProps {
  projects: DepartmentProject[];
}

const StatusBadge: FC<{ status: ProjectStatus }> = ({ status }) => {
  const label =
    status === "on_hold"
      ? "On hold"
      : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className="text-[10px] uppercase tracking-wide px-2 py-1 rounded border">
      {label}
    </span>
  );
};

const fmtDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString() : "—";

const DepartmentProjectList: FC<DepartmentProjectListProps> = ({
  projects,
}) => {
  if (!projects?.length) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
        <p className="text-muted-foreground">
          No projects found for this department.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="truncate">{project.name}</CardTitle>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {project.client_name ?? "—"}
            </p>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground">
              {project.description ?? "No description"}
            </p>

            <div className="flex items-center text-sm text-muted-foreground mt-4">
              <span>{fmtDate(project.start_date)}</span>
              <span className="mx-2">–</span>
              <span>
                {project.end_date ? fmtDate(project.end_date) : "Ongoing"}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DepartmentProjectList;
