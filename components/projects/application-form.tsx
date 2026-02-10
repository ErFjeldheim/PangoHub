import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";

interface ApplicationFormProps {
  projectId: string;
  userId: string | null;
  iApplied: boolean;
  applyAction: (formData: FormData) => Promise<void>;
  withdrawAction: (formData: FormData) => Promise<void>;
}

export function ApplicationForm({
  projectId,
  userId,
  iApplied,
  applyAction,
  withdrawAction,
}: ApplicationFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Join This Project
        </CardTitle>
        <CardDescription>
          Express your interest in working on this project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!userId ? (
          <p className="text-sm text-muted-foreground">
            Please log in to apply for this project
          </p>
        ) : iApplied ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You have already applied to this project
            </p>
            <form action={withdrawAction}>
              <input type="hidden" name="project_id" value={projectId} />
              <Button variant="outline" type="submit">
                <UserMinus className="h-4 w-4 mr-2" />
                Withdraw Application
              </Button>
            </form>
          </div>
        ) : (
          <form action={applyAction} className="space-y-4">
            <input type="hidden" name="project_id" value={projectId} />
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us why you're interested in this project..."
                className="mt-1.5"
                rows={4}
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Apply to Project
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
