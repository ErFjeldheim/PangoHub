import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, CheckCircle } from "lucide-react";

interface Applicant {
  profile_id: string;
  display_name: string;
  title?: string | null;
  message?: string | null;
  created_at: string;
}

interface ApplicantsListProps {
  projectId: string;
  applicants: Applicant[];
  roleOptions: string[];
  approveAction: (formData: FormData) => Promise<void>;
}

export function ApplicantsList({
  projectId,
  applicants,
  roleOptions,
  approveAction,
}: ApplicantsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Applicants
        </CardTitle>
        <CardDescription>Review and approve project applicants</CardDescription>
      </CardHeader>
      <CardContent>
        {applicants.length ? (
          <div className="space-y-6">
            {applicants.map((a) => (
              <div
                key={a.profile_id}
                className="p-4 rounded-lg border bg-card space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {a.display_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <a
                        href={`/dashboard/consultants/${a.profile_id}`}
                        className="font-semibold hover:text-primary transition-colors"
                      >
                        {a.display_name}
                      </a>
                      <p className="text-sm text-muted-foreground">
                        {a.title || "—"}
                      </p>
                    </div>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString()}
                  </time>
                </div>

                {a.message && (
                  <p className="text-sm bg-muted/50 p-3 rounded-md">
                    {a.message}
                  </p>
                )}

                <form
                  action={approveAction}
                  className="flex flex-wrap items-end gap-3 pt-3 border-t"
                >
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="profile_id" value={a.profile_id} />

                  <div className="flex-1 min-w-[180px]">
                    <Label htmlFor={`role-${a.profile_id}`}>Role</Label>
                    <Select name="role" defaultValue="Consultant">
                      <SelectTrigger
                        id={`role-${a.profile_id}`}
                        className="mt-1.5"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-28">
                    <Label htmlFor={`hours-${a.profile_id}`}>Hours</Label>
                    <Input
                      id={`hours-${a.profile_id}`}
                      name="hours"
                      type="number"
                      min={0}
                      placeholder="40"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="w-40">
                    <Label htmlFor={`start-${a.profile_id}`}>Start Date</Label>
                    <Input
                      id={`start-${a.profile_id}`}
                      name="start_date"
                      type="date"
                      className="mt-1.5"
                    />
                  </div>

                  <Button type="submit">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No applicants yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
