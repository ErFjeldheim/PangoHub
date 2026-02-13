"use client";

import { SalesLead, deleteSalesLead, getLeadDepartmentHours, updateLeadHours } from "@/app/actions/sales";
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
import { Calendar, Briefcase, ChevronRight, Trash2, Building, Save, Loader2 } from "lucide-react";
import { ResourceMatcher } from "./ResourceMatcher";
import { SuggestedTeam } from "./SuggestedTeam";
import { Button } from "@/components/ui/button";
import { SalesLeadForm } from "./SalesLeadForm";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getDepartments } from "@/app/actions/departments";
import { Input } from "@/components/ui/input";
import { HOURLY_RATE } from "@/lib/sales/templates";

export function SalesLeadList({ leads }: { leads: SalesLead[] }) {
  const { t } = useLanguage();
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [localLeads, setLocalLeads] = useState<SalesLead[]>(leads);

  useEffect(() => {
      setLocalLeads(leads);
  }, [leads]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(t.sales.list.confirmDelete)) {
          await deleteSalesLead(id);
      }
  };

  const updateLeadInState = (updated: Partial<SalesLead> & { id: string }) => {
      setLocalLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
  };

  if (localLeads.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/50 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium">{t.sales.list.noLeads}</h3>
        <p className="text-muted-foreground">{t.sales.list.noLeadsDesc}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {localLeads.map((lead) => (
        <Sheet key={lead.id} open={openLeadId === lead.id} onOpenChange={(open) => setOpenLeadId(open ? lead.id : null)}>
          <Card className="hover:border-primary/50 transition-colors group relative overflow-hidden">
            {lead.totalPrice && lead.totalPrice > 0 && (
                <div className="absolute top-0 right-0 p-2 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-wider rounded-bl-lg border-l border-b border-primary/20">
                    {lead.totalPrice.toLocaleString()} kr
                </div>
            )}
            
            <div className="flex items-start justify-between p-6 pb-2">
                <SheetTrigger asChild>
                    <div className="flex-1 cursor-pointer pr-12">
                        <CardTitle className="group-hover:text-primary transition-colors">
                            {lead.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-1 mt-1">
                            {lead.description}
                        </CardDescription>
                    </div>
                </SheetTrigger>

                <div className="flex items-center gap-2 shrink-0">
                    <SalesLeadForm lead={lead} onUpdate={updateLeadInState} />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={(e) => handleDelete(e, lead.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                        </Button>
                    </SheetTrigger>
                </div>
            </div>

            <SheetTrigger asChild>
                <CardContent className="cursor-pointer pt-0 pb-6">
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
                        {t.sales.list.mockBadge}
                    </Badge>
                    </div>
                </CardContent>
            </SheetTrigger>
          </Card>

          <SheetContent className="w-[400px] sm:w-[640px] overflow-y-auto">
            {openLeadId === lead.id && (
                <LazySheetContent 
                    lead={lead} 
                    t={t} 
                    onDelete={(id) => handleDelete({ preventDefault: () => {}, stopPropagation: () => {} } as any, id)}
                    onUpdate={updateLeadInState}
                />
            )}
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}

function LazySheetContent({ 
    lead, 
    t, 
    onDelete,
    onUpdate
}: { 
    lead: SalesLead, 
    t: any, 
    onDelete: (id: string) => void,
    onUpdate: (u: Partial<SalesLead> & { id: string }) => void
}) {
    const [deptHours, setDeptHours] = useState<Record<string, number>>({});
    const [allDepts, setAllDepts] = useState<{id: string, name: string}[]>([]);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [depts, hours] = await Promise.all([
                getDepartments(),
                getLeadDepartmentHours(lead.id)
            ]);
            setAllDepts(depts.map(d => ({ id: d.id, name: d.name })));
            setDeptHours(hours);
        };
        load();
    }, [lead.id]);

    const handleHourChange = (name: string, val: string) => {
        const num = Number(val) || 0;
        setDeptHours(prev => ({ ...prev, [name]: num }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await updateLeadHours(lead.id, deptHours);
        if (result.ok) {
            onUpdate({
                id: lead.id,
                totalHours: result.totalHours,
                totalPrice: result.totalPrice,
                hours_required: result.totalHours
            });
            setHasChanges(false);
        }
        setSaving(false);
    };

    const liveTotalHours = Object.values(deptHours).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const liveTotalPrice = liveTotalHours * 675;

    return (
        <>
            <SheetHeader className="mb-6 text-left">
            <div className="flex justify-between items-start">
                <SheetTitle className="text-2xl font-bold">{lead.name}</SheetTitle>
                <div className="flex items-center gap-1 shrink-0 pr-8">
                    <SalesLeadForm lead={lead} onUpdate={onUpdate} />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(lead.id)}
                    >
                        <Trash2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>
            <SheetDescription className="text-base">{lead.description}</SheetDescription>
            
            <div className="mt-6 space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Department Allocation</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    {allDepts.map(dept => (
                        <div key={dept.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border border-dashed hover:border-primary/30 transition-colors">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate flex items-center gap-1.5">
                                    <Building className="h-3 w-3" />
                                    {dept.name}
                                </p>
                            </div>
                            <Input 
                                type="number" 
                                className="h-8 w-20 text-right text-xs bg-transparent border-none focus-visible:ring-1" 
                                value={deptHours[dept.name] || 0}
                                onChange={(e) => handleHourChange(dept.name, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">{t.sales.list.estHours}</span>
                            <span className="text-xl font-bold">{liveTotalHours}h</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-muted-foreground font-bold">{t.sales.list.estPrice}</span>
                            <span className="text-xl font-bold text-primary">{liveTotalPrice.toLocaleString()} kr</span>
                        </div>
                    </div>

                    {hasChanges && (
                        <Button size="sm" className="gap-2 animate-in fade-in slide-in-from-right-2" onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {saving ? t.common.saving : t.common.save}
                        </Button>
                    )}
                </div>
            </div>
            </SheetHeader>
            
            <SuggestedTeam lead={lead} />

            <div className="mt-8 pt-8 border-t">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    {t.sales.list.resourcePool}
                </h3>
                <ResourceMatcher lead={lead} />
            </div>
        </>
    );
}
