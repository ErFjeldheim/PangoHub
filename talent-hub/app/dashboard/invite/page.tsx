"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function InvitePage() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"consultant" | "admin">("consultant")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const generateInviteToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = generateInviteToken()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase.from("invitations").insert({
        email,
        role,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

      if (error) throw error

      // In a real app, you'd send an email here
      const inviteUrl = `${window.location.origin}/auth/signup?token=${token}`

      toast.success("Invitation sent!", {
        description: `Invitation link: ${inviteUrl}`,
      })

      setEmail("")
      setRole("consultant")
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to send invitation",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invite Users</h1>
        <p className="text-muted-foreground">Send invitations to new consultants and administrators.</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Send Invitation</CardTitle>
          <CardDescription>Invite a new user to join the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="consultant@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: "consultant" | "admin") => setRole(value)}>
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
  )
}
