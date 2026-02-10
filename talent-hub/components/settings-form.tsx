// components/settings-form.tsx
"use client";

import type React from "react";
import { useState } from "react";
import { createClient } from "@/lib/pocketbase";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SettingsProfile = {
  email: string;
  role: "admin" | "consultant";
};

interface SettingsFormProps {
  profile: SettingsProfile;
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [email, setEmail] = useState(profile.email || "");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const pb = createClient();

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await pb.collection("users").requestEmailChange(email);

      toast.success("Email update requested!", {
        description: "Please check your new email to confirm the change.",
      });
    } catch (err) {
      const error = err as Error;
      toast.error("Error", {
        description: error.message || "Failed to update email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);

    try {
      await pb.collection("users").requestPasswordReset(profile.email);

      toast.success("Password reset sent!", {
        description: "Check your email for password reset instructions.",
      });
    } catch (err) {
      const error = err as Error;
      toast.error("Error", {
        description: error.message || "Failed to send password reset",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      if (pb.authStore.record) {
          await pb.collection("users").delete(pb.authStore.record.id);
          pb.authStore.clear();
          document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          router.push("/auth/login");
      }

      toast.success("Account deleted");
    } catch (err) {
      const error = err as Error;
      toast.error("Error", {
        description: error.message || "Failed to delete account",
      });
    } finally {

      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account information and security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Email"}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePasswordReset}
              disabled={isLoading}
            >
              Reset Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>Your current role and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Role:</span>
              <span className="text-sm capitalize bg-primary/10 text-primary px-2 py-1 rounded">
                {profile.role}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {profile.role === "admin"
                ? "You have full access to manage consultants, send invitations, and view analytics."
                : "You can manage your profile and view other consultants in the network."}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
