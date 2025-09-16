"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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
import { Plus, X } from "lucide-react";

interface Education {
  id?: string;
  institution: string;
  program: string;
  degree_level?: string;
  start_year?: number;
  end_year?: number;
}

interface EducationManagerProps {
  profileId: string;
}

export function EducationManager({ profileId }: EducationManagerProps) {
  const supabase = createClient();
  const [educations, setEducations] = useState<Education[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEducations() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("educations")
        .select("*")
        .eq("profile_id", profileId)
        .order("end_year", { ascending: false });

      if (error) {
        console.error("Error fetching educations:", error);
        toast.error("Failed to fetch educations");
      } else {
        setEducations(data);
      }
      setIsLoading(false);
    }

    fetchEducations();
  }, [profileId, supabase]);

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
    const { error } = await supabase
      .from("educations")
      .delete()
      .eq("id", educationId);
    if (error) {
      toast.error("Failed to delete education");
    } else {
      setEducations(educations.filter((edu) => edu.id !== educationId));
      toast.success("Education deleted");
    }
  };

  const handleSave = async () => {
    if (!currentEducation) return;

    const educationToSave = {
      ...currentEducation,
      profile_id: profileId,
    };

    const { data, error } = await supabase
      .from("educations")
      .upsert(educationToSave)
      .select()
      .single();

    if (error) {
      toast.error("Failed to save education");
      console.error("Error saving education:", error);
    } else {
      if (currentEducation.id) {
        // Update existing
        setEducations(
          educations.map((edu) => (edu.id === data.id ? data : edu))
        );
      } else {
        // Add new
        setEducations([data, ...educations]);
      }
      toast.success("Education saved");
      setIsEditing(false);
      setCurrentEducation(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentEducation(null);
  };

  if (isLoading) {
    return <p>Loading educations...</p>;
  }

  if (isEditing && currentEducation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {currentEducation.id ? "Edit" : "Add"} Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Institution</Label>
            <Input
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
            <Label>Program</Label>
            <Input
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
            <Label>Degree Level</Label>
            <Select
              value={currentEducation.degree_level || ""}
              onValueChange={(value) =>
                setCurrentEducation({
                  ...currentEducation,
                  degree_level: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select degree level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bachelor's Degree">
                  Bachelor's Degree
                </SelectItem>
                <SelectItem value="Master's Degree">Master's Degree</SelectItem>
                <SelectItem value="Doctorate">Doctorate</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Year</Label>
              <Input
                type="number"
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
              <Label>End Year</Label>
              <Input
                type="number"
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
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Education</CardTitle>
        <Button variant="outline" size="sm" onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {educations.map((edu) => (
          <div
            key={edu.id}
            className="flex items-start justify-between p-2 border-b"
          >
            <div>
              <h3 className="font-semibold">{edu.institution}</h3>
              <p className="text-sm text-muted-foreground">
                {edu.program} ({edu.degree_level})
              </p>
              <p className="text-sm text-muted-foreground">
                {edu.start_year} - {edu.end_year}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(edu)}>
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(edu.id!)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
        {educations.length === 0 && (
          <p className="text-muted-foreground italic">
            No education added yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
