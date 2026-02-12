"use client";

import { PROJECT_TEMPLATES, ProjectTemplate, HOURLY_RATE } from "@/lib/sales/templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Clock, DollarSign } from "lucide-react";

export function TemplateSelector({ onSelect }: { onSelect: (template: ProjectTemplate) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {PROJECT_TEMPLATES.map((template) => (
        <Card 
          key={template.id} 
          className="cursor-pointer hover:border-primary transition-all hover:bg-muted/50 group"
          onClick={() => onSelect(template)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base group-hover:text-primary">{template.name}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{template.estimatedHours}h</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{(template.estimatedHours * HOURLY_RATE).toLocaleString()} kr</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {template.departments.map(d => (
                <Badge key={d.name} variant="outline" className="text-[10px] py-0">
                  {d.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
