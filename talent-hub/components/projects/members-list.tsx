import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users, Trash2 } from "lucide-react";

type Member = {
  profile_id: string;
  display_name: string;
  title: string | null;
  role: string | null;
  hours: number | null;
  start_date: string | null;
  end_date: string | null;
  contribution: string | null;
};

export function MembersList({
  members,
  isAdmin,
  projectId,
  updateAction,
  removeAction,
}: {
  members: Member[];
  isAdmin: boolean;
  projectId: string;
  updateAction: (fd: FormData) => Promise<void>;
  removeAction: (fd: FormData) => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" /> Team
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.length ? (
          members.map((m) => (
            <div key={m.profile_id} className="rounded border p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{m.display_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {m.title || "—"} {m.role ? `• ${m.role}` : ""}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {m.start_date || "—"} → {m.end_date || "ongoing"}
                </div>
              </div>

              <div className="mt-2 text-sm">Hours: {m.hours ?? "—"}</div>

              {isAdmin && (
                <div className="mt-3 flex items-end gap-2">
                  <form
                    action={updateAction}
                    className="flex items-end gap-2 flex-wrap"
                  >
                    <input type="hidden" name="project_id" value={projectId} />
                    <input
                      type="hidden"
                      name="profile_id"
                      value={m.profile_id}
                    />
                    <div>
                      <Label htmlFor={`role-${m.profile_id}`}>Role</Label>
                      <Input
                        id={`role-${m.profile_id}`}
                        name="role"
                        defaultValue={m.role ?? ""}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`hours-${m.profile_id}`}>Hours</Label>
                      <Input
                        id={`hours-${m.profile_id}`}
                        name="hours"
                        type="number"
                        min={0}
                        defaultValue={m.hours ?? ""}
                        className="h-8 w-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`start-${m.profile_id}`}>Start</Label>
                      <Input
                        id={`start-${m.profile_id}`}
                        name="start_date"
                        type="date"
                        defaultValue={m.start_date ?? ""}
                        className="h-8"
                      />
                    </div>
                    <Button size="sm" variant="outline">
                      Save
                    </Button>
                  </form>
                  <form action={removeAction}>
                    <input type="hidden" name="project_id" value={projectId} />
                    <input
                      type="hidden"
                      name="profile_id"
                      value={m.profile_id}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      type="submit"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No members yet</p>
        )}
      </CardContent>
    </Card>
  );
}
