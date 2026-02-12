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
import { createSalesLead } from "@/app/actions/sales";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type FormData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  skills: string;
};

export function SalesLeadForm() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    const skills = data.skills.split(",").map((s) => s.trim()).filter(Boolean);
    
    await createSalesLead({
      name: data.name,
      description: data.description,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
      skills,
    });
    
    setIsSubmitting(false);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Sales Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Sales Lead (Mock Project)</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills (comma separated)</Label>
            <Input 
                id="skills" 
                placeholder="React, TypeScript, AWS" 
                {...register("skills")} 
            />
            <p className="text-xs text-muted-foreground">
              These will be used to find matching consultants.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
