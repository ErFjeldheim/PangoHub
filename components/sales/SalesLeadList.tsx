"use client";

import { SalesLead, deleteSalesLead, getLeadRequirements } from "@/app/actions/sales";
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
import { Calendar, Briefcase, ChevronRight, DollarSign, Trash2 } from "lucide-react";
import { ResourceMatcher } from "./ResourceMatcher";
import { SuggestedTeam } from "./SuggestedTeam";
import { Button } from "@/components/ui/button";
import { SalesLeadForm } from "./SalesLeadForm";
import { useState, useEffect } from "react";

export function SalesLeadList({ leads }: { leads: SalesLead[] }) {
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this mock project?")) {
          await deleteSalesLead(id);
      }
  };

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
        <Sheet key={lead.id} open={openLeadId === lead.id} onOpenChange={(open) => setOpenLeadId(open ? lead.id : null)}>
          <SheetTrigger asChild>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors group relative overflow-hidden">
              {lead.totalPrice && lead.totalPrice > 0 && (
                <div className="absolute top-0 right-0 p-2 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-bl-lg border-l border-b border-primary/20">
                  {lead.totalPrice.toLocaleString()} kr
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="pr-12">
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {lead.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-1 mt-1">
                      {lead.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <SalesLeadForm lead={lead} />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={(e) => handleDelete(e, lead.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
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
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{lead.totalHours || lead.hours_required || 0}h</span>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    Mock Project
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            {openLeadId === lead.id && (
                <>
                    <SheetHeader className="mb-6 text-left">
                    <div className="flex justify-between items-start">
                        <SheetTitle className="text-2xl font-bold">{lead.name}</SheetTitle>
                        <div className="flex items-center gap-1 shrink-0">
                            <SalesLeadForm lead={lead} />
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-muted-foreground hover:text-destructive"
                                onClick={(e) => handleDelete(e, lead.id)}
                            >
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <SheetDescription className="text-base">{lead.description}</SheetDescription>
                    {lead.totalPrice && lead.totalPrice > 0 && (
                        <div className="flex gap-4 mt-4 p-3 bg-muted rounded-lg">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Estimated Hours</span>
                                <span className="text-lg font-bold">{lead.totalHours}h</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold">Estimated Price</span>
                                <span className="text-lg font-bold text-primary">{lead.totalPrice.toLocaleString()} kr</span>
                                <span className="text-[10px] text-muted-foreground italic">Excl. VAT</span>
                            </div>
                        </div>
                    )}
                    </SheetHeader>
                    
                    <SuggestedTeam lead={lead} />

                    <div className="mt-8 pt-8 border-t">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                            Available Resource Pool
                        </h3>
                        <ResourceMatcher lead={lead} />
                    </div>
                </>
            )}
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
