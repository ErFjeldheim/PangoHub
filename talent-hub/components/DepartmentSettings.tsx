// components/DepartmentSettings.tsx
"use client";

import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { updateDepartment, deleteDepartment } from "@/app/actions/departments";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DepartmentSettingsProps {
  department: {
    id: string;
    name: string;
    description: string | null; // ← allow null
    leader_profile_id?: string | null; // ← allow undefined/null
  };
  consultants: {
    id: string;
    display_name: string;
  }[];
}

const DepartmentSettings: FC<DepartmentSettingsProps> = ({
  department,
  consultants,
}) => {
  const router = useRouter();
  const [name, setName] = useState(department.name);
  const [description, setDescription] = useState(department.description ?? ""); // ← guard null to ""
  const [leaderId, setLeaderId] = useState<string | null>(
    department.leader_profile_id ?? null
  );

  const handleUpdate = async () => {
    await updateDepartment(department.id, {
      name,
      description: description, // ← persist empty string as null if you prefer
      leader_profile_id: leaderId,
    });
    alert("Department updated successfully!");
  };

  const handleDelete = async () => {
    if (
      confirm(
        "Are you sure you want to delete this department? This action cannot be undone."
      )
    ) {
      await deleteDepartment(department.id);
      alert("Department deleted successfully!");
      router.push("/dashboard/departments");
    }
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Department Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leader">Department Leader</Label>
            <Select
              value={leaderId ?? "none"} // ← use "none" instead of ""
              onValueChange={
                (value) => setLeaderId(value === "none" ? null : value) // ← map "none" → null
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a leader" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No leader</SelectItem>
                {consultants.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleUpdate}>Save Changes</Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Delete Department</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Permanently delete this department and all of its associated data.
            This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter className="border-t border-destructive px-6 py-4">
          <Button variant="destructive" onClick={handleDelete}>
            Delete Department
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DepartmentSettings;
