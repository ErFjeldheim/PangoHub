import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, X } from "lucide-react";

interface Skill {
  id: string;
  name: string;
}

interface RequiredSkillsProps {
  projectId: string;
  skills: Skill[];
  allSkills?: Array<{ id: string; name: string }> | null;
  isAdmin: boolean;
  addAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
}

export function RequiredSkills({
  projectId,
  skills,
  allSkills,
  isAdmin,
  addAction,
  removeAction,
}: RequiredSkillsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Required Skills
        </CardTitle>
        <CardDescription>Skills needed for this project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.length ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <form key={s.id} action={removeAction}>
                <input type="hidden" name="project_id" value={projectId} />
                <input type="hidden" name="skill_id" value={s.id} />
                <Badge variant="secondary" className="text-sm py-1.5 px-3">
                  {s.name}
                  {isAdmin && (
                    <button
                      type="submit"
                      className="ml-2 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              </form>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No skills linked yet</p>
        )}

        {isAdmin && allSkills && (
          <form action={addAction} className="flex gap-3 pt-4 border-t">
            <input type="hidden" name="project_id" value={projectId} />
            <div className="flex-1">
              <Label htmlFor="skill_id" className="sr-only">
                Select skill
              </Label>
              <Select name="skill_id">
                <SelectTrigger>
                  <SelectValue placeholder="Select a skill to add" />
                </SelectTrigger>
                <SelectContent>
                  {allSkills.map((sk) => (
                    <SelectItem key={sk.id} value={sk.id}>
                      {sk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Add Skill</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
