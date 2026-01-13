// components/admin-settings.tsx
"use client";

import { useOptimistic } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Shield, User } from "lucide-react";
import type { AdminUser } from "@/types/admin";
import type { Invitation } from "@/types/invitation";

type Props = {
  initialUsers: AdminUser[];
  initialInvitations: Invitation[];
  setUserRoleAction: (fd: FormData) => Promise<void>;
  deleteInvitationAction: (fd: FormData) => Promise<void>;
};

export function AdminSettings({
  initialUsers,
  initialInvitations,
  setUserRoleAction,
  deleteInvitationAction,
}: Props) {
  const [users, setUsers] = useOptimistic(initialUsers);
  const [invitations, setInvitations] = useOptimistic(initialInvitations);

  return (
    <div className="space-y-6">
      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user roles and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((u) => {
              const nextRole = u.is_admin ? "consultant" : "admin";
              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {u.is_admin ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{u.display_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {u.email ?? "No email visible"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={u.is_admin ? "default" : "secondary"}>
                      {u.is_admin ? "admin" : "consultant"}
                    </Badge>

                    <form
                      action={async (fd: FormData) => {
                        setUsers((prev) =>
                          prev.map((x) =>
                            x.id === u.id ? { ...x, is_admin: !u.is_admin } : x
                          )
                        ); // optimistic
                        await setUserRoleAction(fd);
                      }}
                    >
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="newRole" value={nextRole} />
                      <Button variant="outline" size="sm" type="submit">
                        {u.is_admin ? "Make Consultant" : "Make Admin"}
                      </Button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Manage outstanding invitations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invitations.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No pending invitations
              </p>
            ) : (
              invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{inv.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {inv.role} • Expires:{" "}
                      {new Date(inv.expires_at).toLocaleDateString()}
                    </p>
                  </div>

                  <form
                    action={async (fd: FormData) => {
                      setInvitations((prev) =>
                        prev.filter((i) => i.id !== inv.id)
                      ); // optimistic
                      await deleteInvitationAction(fd);
                    }}
                  >
                    <input type="hidden" name="invitationId" value={inv.id} />
                    <Button
                      variant="outline"
                      size="sm"
                      type="submit"
                      aria-label="Delete invitation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
