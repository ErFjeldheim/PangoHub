"use client";

import { ProjectCard } from "@/components/projects/project-card";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { ProjectFilters } from "@/components/projects/project-filters";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Client } from "@/types/pocketbase";

interface ProjectsClientViewProps {
  isAdmin: boolean;
  projects: any[];
  departments: { id: string; name: string; consultant_count: number }[];
  clients: Client[];
  searchParams?: {
    q?: string;
    status?: string;
    dep?: string;
  };
  createProjectAction: (formData: FormData) => Promise<void>;
}

export function ProjectsClientView({
  isAdmin,
  projects,
  departments,
  clients,
  searchParams,
  createProjectAction,
}: ProjectsClientViewProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 lg:p-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{t.projects.title}</h1>
          <p className="text-muted-foreground text-lg">
            {t.projects.subtitle}
          </p>
        </header>

        {isAdmin && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full md:w-auto bg-card border-border shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t.projects.createNew}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <CreateProjectForm
                action={createProjectAction}
                clients={clients}
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        <ProjectFilters searchParams={searchParams} departments={departments} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={{ ...p, departments: p.departments ?? undefined }}
              href={`/dashboard/projects/${p.id}`}
            />
          ))}

          {!projects.length && (
            <div className="col-span-full text-center py-12 bg-card rounded-xl border shadow-sm">
              <p className="text-muted-foreground text-lg">
                {t.projects.noProjects}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
