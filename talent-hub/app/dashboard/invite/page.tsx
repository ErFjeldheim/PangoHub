"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import {
  createInvitation,
  deleteInvitation,
  getInvitations,
} from "@/app/actions/invitations";
import { PendingInvitationItem } from "@/components/PendingInvitationItem";

export default function InvitePage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"consultant" | "admin">("consultant");
  const [isLoading, setIsLoading] = useState(false);
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    const fetchInvitations = async () => {
      const fetchedInvitations = await getInvitations();
      setInvitations(fetchedInvitations);
    };
    fetchInvitations();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createInvitation(email, role);
      toast.success("Invitation sent!");
      setEmail("");
      setRole("consultant");
      // Refresh invitations list
      const fetchedInvitations = await getInvitations();
      setInvitations(fetchedInvitations);
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
      setInvitations(invitations.filter((inv) => inv.id !== id));
      toast.success("Invitation deleted!");
    } catch (error) {
      toast.error("Error", {
        description:
          error instanceof Error ? error.message : "Failed to delete invitation",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invite Users</h1>
        <p className="text-muted-foreground">
          Send invitations to new consultants and administrators.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  onValueChange={(value: "consultant" | "admin") =>
                    setRole(value)
                  }
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

        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              These invitations have not been accepted yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {invitations.length > 0 ? (
              invitations.map((invitation) => (
                <PendingInvitationItem
                  key={invitation.id}
                  invitation={invitation}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No pending invitations.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}