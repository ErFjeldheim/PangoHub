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
import { createSalesLead, createSalesLeadFromTemplate, updateSalesLead, getLeadRequirements, SalesLead } from "@/app/actions/sales";
import { Plus, LayoutTemplate, Settings2, Pencil, Clock, DollarSign } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";
import { ProjectTemplate, PROJECT_TEMPLATES, HOURLY_RATE } from "@/lib/sales/templates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type FormData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  skills: string;
  hoursRequired: number;
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
      defaultValues: lead ? {
          name: lead.name,
          description: lead.description || "",
          startDate: lead.start_date ? new Date(lead.start_date).toISOString().split('T')[0] : "",
          endDate: lead.end_date ? new Date(lead.end_date).toISOString().split('T')[0] : "",
          hoursRequired: lead.hours_required || 0
      } : {
          hoursRequired: 0
      }
  });

  const hours = watch("hoursRequired");

  // Fetch skills only when editing and dialog opens
  useEffect(() => {
      if (isEdit && open && lead) {
          const loadSkills = async () => {
              try {
                  const reqs = await getLeadRequirements(lead.id);
                  setValue("skills", reqs.skills.join(", "), { shouldDirty: false });
              } catch (error) {
                  console.error("Failed to load skills:", error);
              }
          };
          loadSkills();
      }
  }, [isEdit, open, lead?.id, setValue]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSelectTemplate = (template: ProjectTemplate) => {
      setSelectedTemplateId(template.id);
      setActiveTab("details");
      setValue("name", `${template.name} for ...`);
      setValue("hoursRequired", template.estimatedHours);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
        if (isEdit && lead) {
            const skills = data.skills?.split(",").map((s) => s.trim()).filter(Boolean) || [];
            await updateSalesLead(lead.id, {
                name: data.name,
                description: data.description,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
                skills,
                hoursRequired: Number(data.hoursRequired)
            });
        } else if (selectedTemplateId) {
            await createSalesLeadFromTemplate({
                templateId: selectedTemplateId,
                name: data.name,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
            });
        } else {
            const skills = data.skills?.split(",").map((s) => s.trim()).filter(Boolean) || [];
            await createSalesLead({
              name: data.name,
              description: data.description,
              startDate: data.startDate || undefined,
              endDate: data.endDate || undefined,
              skills,
              hoursRequired: Number(data.hoursRequired)
            });
        }
        setOpen(false);
    } catch (error) {
        console.error("Submit failed:", error);
    } finally {
        setIsSubmitting(false);
        if (!isEdit) {
            setSelectedTemplateId(null);
            setActiveTab("templates");
            reset();
        }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val && !isEdit) {
            setSelectedTemplateId(null);
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
        
        {!isEdit ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates" className="gap-2">
                    <LayoutTemplate className="h-4 w-4" />
                    {t.sales.tabs.templates}
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    {t.sales.tabs.details}
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="py-4">
                <TemplateSelector onSelect={onSelectTemplate} />
                <div className="mt-4 flex justify-center">
                    <Button variant="link" onClick={() => setActiveTab("details")}>
                        {t.sales.form.manualLink}
                    </Button>
                </div>
            </TabsContent>
            
            <TabsContent value="details" className="py-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                {!selectedTemplateId && (
                    <div className="space-y-2">
                        <Label htmlFor="skills">{t.sales.form.requiredSkills}</Label>
                        <Input 
                            id="skills" 
                            placeholder={t.sales.form.skillsPlaceholder} 
                            {...register("skills")} 
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="hours">{t.sales.form.estimatedHours}</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="hours" type="number" className="pl-9" {...register("hoursRequired")} />
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

                {selectedTemplateId && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                        <p className="text-sm font-medium text-primary flex items-center gap-2">
                            <LayoutTemplate className="h-4 w-4" />
                            {t.sales.form.templateBadge.replace("{name}", PROJECT_TEMPLATES.find(t => t.id === selectedTemplateId)?.name || "")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {t.sales.form.templateHint}
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveTab("templates")}>
                        {t.sales.form.back}
                    </Button>
                    <Button type="submit" className="flex-[2]" disabled={isSubmitting}>
                        {isSubmitting ? t.sales.form.creating : t.sales.form.create}
                    </Button>
                </div>
                </form>
            </TabsContent>
            </Tabs>
        ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name">{t.sales.form.clientName}</Label>
                    <Input id="edit-name" {...register("name", { required: true })} />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="edit-description">{t.sales.form.description}</Label>
                    <Textarea id="edit-description" {...register("description")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-startDate">{t.sales.form.startDate}</Label>
                        <Input id="edit-startDate" type="date" {...register("startDate")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-endDate">{t.sales.form.endDate}</Label>
                        <Input id="edit-endDate" type="date" {...register("endDate")} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="edit-skills">{t.sales.form.requiredSkills}</Label>
                    <Input 
                        id="edit-skills" 
                        placeholder={t.sales.form.skillsPlaceholder}
                        {...register("skills")} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-hours">{t.sales.form.estimatedHours}</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input id="edit-hours" type="number" className="pl-9" {...register("hoursRequired")} />
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

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t.sales.form.saving : t.sales.form.save}
                </Button>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
