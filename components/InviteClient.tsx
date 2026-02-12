// app/dashboard/invite/InviteClient.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { createInvitation, deleteInvitation } from "@/app/actions/invitations";
import {
  approveAccessRequest,
  rejectAccessRequest,
  type AccessRequest,
} from "@/app/actions/accessRequest";
import { PendingInvitationItem } from "@/components/PendingInvitationItem";

type Role = "consultant" | "admin" | "seller";

type Invitation = {
  id: string;
  email: string;
  role: Role;
  expires_at: string;
  created_at?: string;
};

export default function InviteClient({
  initialInvitations,
  initialAccessRequests,
}: {
  initialInvitations: Invitation[];
  initialAccessRequests: AccessRequest[];
}) {
  // Invitations state
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("consultant");
  const [isLoading, setIsLoading] = useState(false);
  const [pending, setPending] = useState<Invitation[]>(
    initialInvitations ?? []
  );

  // Access Requests state
  const [requests, setRequests] = useState<AccessRequest[]>(
    initialAccessRequests ?? []
  );
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  // === Invitations handlers ===
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      const { inviteUrl } = await createInvitation(cleanEmail, role);

      setPending((prev) => [
        {
          id: crypto.randomUUID(),
          email: cleanEmail,
          role,
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        ...prev,
      ]);

      toast.success("Invitation sent!", {
        description: `Invitation link: ${inviteUrl}`,
      });

      setEmail("");
      setRole("consultant");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to send invitation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvitation(id);
      setPending((p) => p.filter((i) => i.id !== id));
      toast.success("Invitation deleted");
    } catch {
      toast.error("Could not delete invitation");
    }
  };

  // === Access Requests handlers ===
  const handleApprove = async (id: string, asRole: Role) => {
    setActionBusyId(id);
    try {
      const { inviteUrl } = await approveAccessRequest(id, asRole);
      // remove from list
      setRequests((r) => r.filter((x) => x.id !== id));
      toast.success("Request approved", {
        description: `Invitation created (${asRole}). Link: ${inviteUrl}`,
      });
    } catch (err) {
      toast.error("Failed to approve request", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setActionBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionBusyId(id);
    try {
      await rejectAccessRequest(id);
      setRequests((r) => r.filter((x) => x.id !== id));
      toast.success("Request rejected");
    } catch (err) {
      toast.error("Failed to reject request", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setActionBusyId(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Right column (spans 2 rows) */}
      <Card className="md:col-start-2 md:row-span-2">
        <CardHeader>
          <CardTitle>Access requests</CardTitle>
          <CardDescription>
            Review and approve or reject requests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending requests.
            </p>
          ) : (
            <ul className="space-y-3">
              {requests.map((req) => (
                <li
                  key={req.id}
                  className="flex items-start justify-between rounded-lg border p-3"
                >
                  <div className="pr-3">
                    <p className="text-sm font-medium">
                      {req.name ?? "Unknown"} — {req.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                      {req.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested: {new Date(req.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionBusyId === req.id}
                      onClick={() => handleApprove(req.id, "consultant")}
                    >
                      {actionBusyId === req.id
                        ? "Working..."
                        : "Approve (Consultant)"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionBusyId === req.id}
                      onClick={() => handleApprove(req.id, "admin")}
                    >
                      {actionBusyId === req.id
                        ? "Working..."
                        : "Approve (Admin)"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionBusyId === req.id}
                      onClick={() => handleReject(req.id)}
                    >
                      {actionBusyId === req.id ? "Working..." : "Reject"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Left column, row 1: Pending invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending invitations</CardTitle>
          <CardDescription>Invites not yet accepted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No pending invitations.
            </p>
          ) : (
            pending.map((inv) => (
              <PendingInvitationItem
                key={inv.id}
                invitation={inv}
                onDelete={handleDelete}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Left column, row 2: Send new invitation */}
      <Card>
        <CardHeader>
          <CardTitle>Send Invitation</CardTitle>
          <CardDescription>
            Invite a new user to join the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="consultant@pangoconsulting.no"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value: Role) => setRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
