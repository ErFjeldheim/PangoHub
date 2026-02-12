"use client";

import { SalesLead } from "@/app/actions/sales";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Calendar, Briefcase, ChevronRight } from "lucide-react";
import { ResourceMatcher } from "./ResourceMatcher";

export function SalesLeadList({ leads }: { leads: SalesLead[] }) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium">No Sales Leads</h3>
        <p className="text-muted-foreground">Create a mock project to start matching consultants.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {leads.map((lead) => (
        <Sheet key={lead.id}>
          <SheetTrigger asChild>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {lead.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 mt-1">
                      {lead.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {(lead.start_date || lead.end_date) && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {lead.start_date ? new Date(lead.start_date).toLocaleDateString() : 'TBD'} 
                        {' - '} 
                        {lead.end_date ? new Date(lead.end_date).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  )}
                  {lead.hours_required && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>{lead.hours_required}h</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="ml-auto">
                    Mock Project
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>{lead.name}</SheetTitle>
              <SheetDescription>{lead.description}</SheetDescription>
            </SheetHeader>
            
            <ResourceMatcher lead={lead} />
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
