"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/pocketbase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus,
  GraduationCap,
  Calendar,
  School,
  Edit2,
  Trash2,
  Save,
  XCircle,
} from "lucide-react";
import { Education } from "@/types/pocketbase";

interface EducationProps {
  profileId: string;
}

export function EducationManager({ profileId }: EducationProps) {
  const pb = createClient();
  const [educations, setEducations] = useState<Education[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Partial<Education> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEducations() {
      setIsLoading(true);
      try {
          const records = await pb.collection("educations").getFullList<Education>({
              filter: `user="${profileId}"`,
              sort: '-end_year'
          });
          setEducations(records);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.isAbort) return;
        console.error("Error fetching educations:", error);
        toast.error("Failed to fetch educations");
      }
      setIsLoading(false);
    }

    fetchEducations();
  }, [profileId, pb]);

  const handleAddNew = () => {
    setCurrentEducation({
      institution: "",
      program: "",
    });
    setIsEditing(true);
  };

  const handleEdit = (education: Education) => {
    setCurrentEducation(education);
    setIsEditing(true);
  };

  const handleDelete = async (educationId: string) => {
    try {
        await pb.collection("educations").delete(educationId);
        setEducations(educations.filter((edu) => edu.id !== educationId));
        toast.success("Education deleted");
    } catch (error) {
        toast.error("Failed to delete education");
    }
  };

  const handleSave = async () => {
    if (!currentEducation) return;

    try {
        let record: Education;
        const payload = {
            ...currentEducation,
            user: profileId
        };

        if (currentEducation.id) {
            record = await pb.collection("educations").update(currentEducation.id, payload);
            setEducations(educations.map((edu) => (edu.id === record.id ? record : edu)));
        } else {
            record = await pb.collection("educations").create(payload);
            setEducations([record, ...educations]);
        }
        
        toast.success("Education saved");
        setIsEditing(false);
        setCurrentEducation(null);
    } catch (error) {
      toast.error("Failed to save education");
      console.error("Error saving education:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentEducation(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading education...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEditing && currentEducation) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl">
              {currentEducation.id ? "Edit" : "Add"} Education
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <School className="h-4 w-4 text-muted-foreground" />
              Institution
            </Label>
            <Input
              className="h-11"
              placeholder="e.g., Harvard University"
              value={currentEducation.institution}
              onChange={(e) =>
                setCurrentEducation({
                  ...currentEducation,
                  institution: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              Program
            </Label>
            <Input
              className="h-11"
              placeholder="e.g., Computer Science"
              value={currentEducation.program}
              onChange={(e) =>
                setCurrentEducation({
                  ...currentEducation,
                  program: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Degree Level</Label>
            <Select
              value={currentEducation.degree_level || ""}
              onValueChange={(value) =>
                setCurrentEducation({
                  ...currentEducation,
                  degree_level: value,
                })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select degree level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bachelor's Degree">
                  Bachelors Degree
                </SelectItem>
                <SelectItem value="Master's Degree">Masters Degree</SelectItem>
                <SelectItem value="Doctorate">Doctorate</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Start Year
              </Label>
              <Input
                className="h-11"
                type="number"
                placeholder="e.g., 2018"
                value={currentEducation.start_year || ""}
                onChange={(e) =>
                  setCurrentEducation({
                    ...currentEducation,
                    start_year: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                End Year
              </Label>
              <Input
                className="h-11"
                type="number"
                placeholder="e.g., 2022"
                value={currentEducation.end_year || ""}
                onChange={(e) =>
                  setCurrentEducation({
                    ...currentEducation,
                    end_year: Number(e.target.value),
                  })
                }
              />
            </div>
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
              Save Education
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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl">Education</CardTitle>
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
        {educations.map((edu) => (
          <div
            key={edu.id}
            className="group relative rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <School className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg leading-tight">
                      {edu.institution}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.program}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pl-[52px]">
                  {edu.degree_level && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      {edu.degree_level}
                    </span>
                  )}
                  {(edu.start_year || edu.end_year) && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {edu.start_year} - {edu.end_year || "Present"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(edu)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(edu.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {educations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              No education added yet
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Add your educational background to complete your profile
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddNew}
              className="gap-2 bg-transparent"
            >
              <Plus className="h-4 w-4" />
              Add Your First Education
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
