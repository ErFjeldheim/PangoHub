"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Briefcase,
  Calendar,
  Building2,
  Edit2,
  Trash2,
  Save,
  XCircle,
} from "lucide-react";
import { Experience } from "@/types/pocketbase";

import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/app/actions/profile";

import { useLanguage } from "@/lib/i18n/LanguageContext";

interface ExperienceProps {
  profileId: string;
  initialExperiences: Experience[];
}

export function ExperienceManager({ profileId, initialExperiences }: ExperienceProps) {
  const { t } = useLanguage();
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Partial<Experience> | null>(
    null
  );
  
  const isLoading = false;

  const handleAddNew = () => {
    setCurrentExperience({
      org: "",
      role: "",
      start_date: "",
      type: "job",
    });
    setIsEditing(true);
  };

  const handleEdit = (experience: Experience) => {
    setCurrentExperience(experience);
    setIsEditing(true);
  };

  const handleDelete = async (experienceId: string) => {
    try {
        await deleteExperience(experienceId);
        setExperiences(experiences.filter((exp) => exp.id !== experienceId));
        toast.success("Experience deleted");
    } catch (error) {
        toast.error("Failed to delete experience");
    }
  };

  const handleSave = async () => {
    if (!currentExperience) return;

    try {
        let record: Experience;
        
        // Sanitize payload: remove empty strings for dates
        const sanitizedPayload: Partial<Experience> = {
            org: currentExperience.org,
            role: currentExperience.role,
            description: currentExperience.description,
            type: currentExperience.type,
            user: profileId,
            start_date: currentExperience.start_date || undefined,
            end_date: currentExperience.end_date || undefined,
        };

        if (!currentExperience.id && !sanitizedPayload.start_date) {
             toast.error("Start date is required");
             return;
        }

        console.log("Saving experience payload:", sanitizedPayload);

        if (currentExperience.id) {
            record = await updateExperience(currentExperience.id, sanitizedPayload);
            setExperiences(experiences.map((exp) => (exp.id === record.id ? record : exp)));
        } else {
            record = await createExperience(sanitizedPayload);
            setExperiences([record, ...experiences]);
        }

        toast.success("Experience saved");
        setIsEditing(false);
        setCurrentExperience(null);
    } catch (error: any) {
      console.error("Error saving experience:", error);
      
      const validationErrors = error?.data?.data;
      if (validationErrors) {
          const messages = Object.keys(validationErrors).map(key => `${key}: ${validationErrors[key].message}`).join(', ');
          toast.error(`Validation failed: ${messages}`);
      } else {
          toast.error("Failed to save experience: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentExperience(null);
  };

  const getTypeBadgeColor = (type: string) => {
    const colors = {
      job: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      part_time: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
      contract:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      volunteer:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      education:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading experiences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEditing && currentExperience) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">
              {currentExperience.id ? "Edit" : "Add"} Experience
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Organization
            </Label>
            <Input
              className="h-11"
              placeholder="e.g., Acme Corporation"
              value={currentExperience.org}
              onChange={(e) =>
                setCurrentExperience({
                  ...currentExperience,
                  org: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Role
            </Label>
            <Input
              className="h-11"
              placeholder="e.g., Senior Consultant"
              value={currentExperience.role}
              onChange={(e) =>
                setCurrentExperience({
                  ...currentExperience,
                  role: e.target.value,
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Start Date
              </Label>
              <Input
                className="h-11"
                type="date"
                value={currentExperience.start_date ? new Date(currentExperience.start_date).toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setCurrentExperience({
                    ...currentExperience,
                    start_date: new Date(e.target.value).toISOString(),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                End Date (optional)
              </Label>
              <Input
                className="h-11"
                type="date"
                value={currentExperience.end_date ? new Date(currentExperience.end_date).toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setCurrentExperience({
                    ...currentExperience,
                    end_date: e.target.value ? new Date(e.target.value).toISOString() : "",
                  })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Type</Label>
            <Select
              value={currentExperience.type}
              onValueChange={(
                value: "job" | "part_time" | "contract" | "volunteer" | "other"
              ) => setCurrentExperience({ ...currentExperience, type: value })}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="job">{t.profile.professional.experienceType.job}</SelectItem>
                <SelectItem value="part_time">{t.profile.professional.experienceType.part_time}</SelectItem>
                <SelectItem value="contract">{t.profile.professional.experienceType.contract}</SelectItem>
                <SelectItem value="volunteer">{t.profile.professional.experienceType.volunteer}</SelectItem>
                <SelectItem value="other">{t.profile.professional.experienceType.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              className="min-h-[120px] resize-none"
              placeholder="Describe your responsibilities and achievements..."
              value={currentExperience.description || ""}
              onChange={(e) =>
                setCurrentExperience({
                  ...currentExperience,
                  description: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2 bg-transparent"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Experience
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Work Experience</CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddNew}
          className="gap-2 bg-transparent"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="group relative rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-tight">
                      {exp.role}
                    </h3>
                    <p className="text-sm text-muted-foreground">{exp.org}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pl-[52px]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(exp.start_date).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {exp.end_date
                        ? new Date(exp.end_date).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Present"}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeBadgeColor(
                      exp.type || 'other'
                    )}`}
                  >
                    {(t.profile.professional.experienceType as any)[exp.type || 'other']}
                  </span>
                </div>

                {exp.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 pl-[52px]">
                    {exp.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(exp)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(exp.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {experiences.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No work experience added yet
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Add your professional experience to showcase your expertise
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNew}
              className="gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Add Your First Experience
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
