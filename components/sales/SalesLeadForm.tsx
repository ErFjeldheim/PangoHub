"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSalesLead, updateSalesLead, getLeadRequirements, getLeadDepartmentHours, SalesLead } from "@/app/actions/sales";
import { Plus, LayoutTemplate, Pencil, Clock, DollarSign, Building } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";
import { ProjectTemplate, PROJECT_TEMPLATES, HOURLY_RATE } from "@/lib/sales/templates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getDepartments } from "@/app/actions/departments";

type FormData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  skills: string;
  hoursRequired: number;
  departmentHours: Record<string, number>;
};

export function SalesLeadForm({ 
    lead 
}: { 
    lead?: SalesLead; 
}) {
  const { t } = useLanguage();
  const isEdit = !!lead;
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(isEdit ? "details" : "templates");
  const [allDepartments, setAllDepartments] = useState<{id: string, name: string}[]>([]);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
      defaultValues: lead ? {
          name: lead.name,
          description: lead.description || "",
          startDate: lead.start_date ? new Date(lead.start_date).toISOString().split('T')[0] : "",
          endDate: lead.end_date ? new Date(lead.end_date).toISOString().split('T')[0] : "",
          hoursRequired: lead.hours_required || 0,
          departmentHours: {}
      } : {
          hoursRequired: 0,
          departmentHours: {}
      }
  });

  const hours = watch("hoursRequired");
  const departmentHours = watch("departmentHours");

  useEffect(() => {
    if (departmentHours) {
        const sum = Object.values(departmentHours).reduce((acc, val) => acc + (Number(val) || 0), 0);
        if (sum !== hours) {
            setValue("hoursRequired", sum, { shouldDirty: true });
        }
    }
  }, [departmentHours, setValue, hours]);

  useEffect(() => {
    const loadData = async () => {
        const depts = await getDepartments();
        setAllDepartments(depts.map(d => ({ id: d.id, name: d.name })));

        if (isEdit && open && lead) {
            try {
                const [reqs, dHours] = await Promise.all([
                    getLeadRequirements(lead.id),
                    getLeadDepartmentHours(lead.id)
                ]);
                setValue("skills", reqs.skills.join(", "), { shouldDirty: false });
                setValue("departmentHours", dHours, { shouldDirty: false });
            } catch (error) {
                console.error("Failed to load project details:", error);
            }
        }
    };
    if (open) loadData();
  }, [isEdit, open, lead?.id, setValue]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSelectTemplate = (template: ProjectTemplate) => {
      setActiveTab("details");
      setValue("name", `${template.name} for ...`);
      setValue("hoursRequired", template.estimatedHours);
      
      const newDeptHours: Record<string, number> = {};
      template.departments.forEach(d => {
          newDeptHours[d.name] = d.hours;
      });
      setValue("departmentHours", newDeptHours);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
        const payload = {
            name: data.name,
            description: data.description,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
            skills: data.skills?.split(",").map((s) => s.trim()).filter(Boolean) || [],
            hoursRequired: Number(data.hoursRequired),
            departmentHours: data.departmentHours
        };

        if (isEdit && lead) {
            await updateSalesLead(lead.id, payload);
        } else {
            await createSalesLead(payload);
        }
        setOpen(false);
    } catch (error) {
        console.error("Submit failed:", error);
    } finally {
        setIsSubmitting(false);
        if (!isEdit) {
            setActiveTab("templates");
            reset();
        }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val && !isEdit) {
            setActiveTab("templates");
            reset();
        }
    }}>
      <DialogTrigger asChild>
        {isEdit ? (
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <Pencil className="h-4 w-4" />
            </Button>
        ) : (
            <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t.sales.newLead}
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
              {isEdit ? t.sales.editLeadTitle.replace("{name}", lead.name) : t.sales.createLeadTitle}
          </DialogTitle>
        </DialogHeader>
        
        {!isEdit && activeTab === "templates" ? (
            <div className="py-4">
                <TemplateSelector onSelect={onSelectTemplate} />
                <div className="mt-4 flex justify-center">
                    <Button variant="link" onClick={() => setActiveTab("details")}>
                        {t.sales.form.manualLink}
                    </Button>
                </div>
            </div>
        ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">General Info</h3>
                        {!isEdit && (
                            <Button variant="ghost" size="sm" type="button" onClick={() => setActiveTab("templates")} className="h-8 text-xs gap-1.5">
                                <LayoutTemplate className="h-3 w-3" />
                                Change Template
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">{t.sales.form.clientName}</Label>
                        <Input id="name" placeholder={t.sales.form.clientPlaceholder} {...register("name", { required: true })} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="description">{t.sales.form.description}</Label>
                        <Textarea id="description" placeholder={t.sales.form.descriptionPlaceholder} {...register("description")} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <Label htmlFor="startDate">{t.sales.form.startDate}</Label>
                        <Input id="startDate" type="date" {...register("startDate")} />
                        </div>
                        <div className="space-y-2">
                        <Label htmlFor="endDate">{t.sales.form.endDate}</Label>
                        <Input id="endDate" type="date" {...register("endDate")} />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Requirements</h3>
                    <div className="space-y-2">
                        <Label htmlFor="skills">{t.sales.form.requiredSkills}</Label>
                        <Input 
                            id="skills" 
                            placeholder={t.sales.form.skillsPlaceholder} 
                            {...register("skills")} 
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>Hours per Department</Label>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {allDepartments.map(dept => (
                                <div key={dept.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md border border-dashed">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold truncate flex items-center gap-1.5">
                                            <Building className="h-3 w-3" />
                                            {dept.name}
                                        </p>
                                    </div>
                                    <Input 
                                        type="number" 
                                        className="h-8 w-20 text-right text-xs" 
                                        placeholder="0"
                                        {...register(`departmentHours.${dept.name}` as any)} 
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Estimation Summary</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="hours">{t.sales.form.estimatedHours}</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="hours" type="number" className="pl-9 bg-muted" readOnly {...register("hoursRequired")} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t.sales.form.estimatedPrice}</Label>
                            <div className="h-10 flex items-center px-3 bg-muted rounded-md font-mono text-sm">
                                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                {(Number(hours || 0) * HOURLY_RATE).toLocaleString()} kr
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting 
                            ? (isEdit ? t.sales.form.saving : t.sales.form.creating) 
                            : (isEdit ? t.sales.form.save : t.sales.form.create)}
                    </Button>
                </div>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
