"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface SettingsFormProps {
  profile: any
}

export function SettingsForm({ profile }: SettingsFormProps) {
  const [email, setEmail] = useState(profile.email || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) throw error

      toast.success("Email updated!", {
        description: "Please check your new email to confirm the change.",
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to update email",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error

      toast.success("Password reset sent!", {
        description: "Check your email for password reset instructions.",
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to send password reset",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)

    try {
      // In a real app, you'd want to handle this server-side
      // For now, we'll just sign out the user
      await supabase.auth.signOut()
      router.push("/auth/login")

      toast.success("Account deletion requested", {
        description: "Please contact an administrator to complete account deletion.",
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to delete account",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account information and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Email"}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={handlePasswordReset} disabled={isLoading}>
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
              <span className="text-sm capitalize bg-primary/10 text-primary px-2 py-1 rounded">{profile.role}</span>
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
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
