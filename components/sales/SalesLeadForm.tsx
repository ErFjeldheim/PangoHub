"use client";

import { useState } from "react";
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
import { createSalesLead, createSalesLeadFromTemplate, updateSalesLead } from "@/app/actions/sales";
import { Plus, LayoutTemplate, Settings2, Pencil } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";
import { ProjectTemplate, PROJECT_TEMPLATES } from "@/lib/sales/templates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesLead } from "@/app/actions/sales";

type FormData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  skills: string;
};

export function SalesLeadForm({ 
    lead, 
    initialSkills = [] 
}: { 
    lead?: SalesLead; 
    initialSkills?: string[] 
}) {
  const isEdit = !!lead;
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(isEdit ? "details" : "templates");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm<FormData>({
      defaultValues: lead ? {
          name: lead.name,
          description: lead.description || "",
          startDate: lead.start_date ? new Date(lead.start_date).toISOString().split('T')[0] : "",
          endDate: lead.end_date ? new Date(lead.end_date).toISOString().split('T')[0] : "",
          skills: initialSkills.join(", ")
      } : undefined
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSelectTemplate = (template: ProjectTemplate) => {
      setSelectedTemplateId(template.id);
      setActiveTab("details");
      setValue("name", `${template.name} for ...`);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    if (isEdit) {
        const skills = data.skills?.split(",").map((s) => s.trim()).filter(Boolean) || [];
        await updateSalesLead(lead.id, {
            name: data.name,
            description: data.description,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
            skills,
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
        });
    }
    
    setIsSubmitting(false);
    setOpen(false);
    if (!isEdit) {
        setSelectedTemplateId(null);
        setActiveTab("templates");
        reset();
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
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors">
                <Pencil className="h-4 w-4" />
            </Button>
        ) : (
            <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Sales Lead
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${lead.name}` : "Create Sales Lead (Mock Project)"}</DialogTitle>
        </DialogHeader>
        
        {!isEdit ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates" className="gap-2">
                    <LayoutTemplate className="h-4 w-4" />
                    Templates
                </TabsTrigger>
                <TabsTrigger value="details" className="gap-2">
                    <Settings2 className="h-4 w-4" />
                    Project Details
                </TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="py-4">
                <TemplateSelector onSelect={onSelectTemplate} />
                <div className="mt-4 flex justify-center">
                    <Button variant="link" onClick={() => setActiveTab("details")}>
                        Or create manual project from scratch
                    </Button>
                </div>
            </TabsContent>
            
            <TabsContent value="details" className="py-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Client / Project Name</Label>
                    <Input id="name" placeholder="e.g. Equinor - Web Revamp" {...register("name", { required: true })} />
                </div>
                
                {!selectedTemplateId && (
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" placeholder="Project goals, scope, etc." {...register("description")} />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" {...register("startDate")} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input id="endDate" type="date" {...register("endDate")} />
                    </div>
                </div>

                {!selectedTemplateId && (
                    <div className="space-y-2">
                        <Label htmlFor="skills">Required Skills (comma separated)</Label>
                        <Input 
                            id="skills" 
                            placeholder="React, TypeScript, AWS" 
                            {...register("skills")} 
                        />
                    </div>
                )}

                {selectedTemplateId && (
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
                        <p className="text-sm font-medium text-primary flex items-center gap-2">
                            <LayoutTemplate className="h-4 w-4" />
                            Template: {PROJECT_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Departments and required skills will be automatically assigned.
                        </p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveTab("templates")}>
                        Back
                    </Button>
                    <Button type="submit" className="flex-[2]" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Lead"}
                    </Button>
                </div>
                </form>
            </TabsContent>
            </Tabs>
        ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-name">Client / Project Name</Label>
                    <Input id="edit-name" {...register("name", { required: true })} />
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea id="edit-description" {...register("description")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-startDate">Start Date</Label>
                        <Input id="edit-startDate" type="date" {...register("startDate")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-endDate">End Date</Label>
                        <Input id="edit-endDate" type="date" {...register("endDate")} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="edit-skills">Required Skills (comma separated)</Label>
                    <Input 
                        id="edit-skills" 
                        {...register("skills")} 
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
