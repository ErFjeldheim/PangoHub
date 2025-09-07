"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Trash2, Shield, User } from "lucide-react"

export function AdminSettings() {
  const [users, setUsers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [usersResult, invitationsResult] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase
          .from("invitations")
          .select("*")
          .is("accepted_at", null)
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false }),
      ])

      if (usersResult.data) setUsers(usersResult.data)
      if (invitationsResult.data) setInvitations(invitationsResult.data)
    } catch (error) {
      toast.error("Error", {
        description: "Failed to load admin data",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: "admin" | "consultant") => {
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) throw error

      setUsers(users.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast.success("Role updated!", {
        description: `User role has been changed to ${newRole}.`,
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to update role",
      })
    }
  }

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase.from("invitations").delete().eq("id", invitationId)

      if (error) throw error

      setInvitations(invitations.filter((inv) => inv.id !== invitationId))

      toast.success("Invitation deleted!", {
        description: "The invitation has been removed.",
      })
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to delete invitation",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading admin settings...</div>
        </CardContent>
      </Card>
    )
  }

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
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {user.role === "admin" ? (
                      <Shield className="h-4 w-4 text-primary" />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  {user.role === "consultant" ? (
                    <Button variant="outline" size="sm" onClick={() => updateUserRole(user.id, "admin")}>
                      Make Admin
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => updateUserRole(user.id, "consultant")}>
                      Make Consultant
                    </Button>
                  )}
                </div>
              </div>
            ))}
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
              <p className="text-muted-foreground text-center py-4">No pending invitations</p>
            ) : (
              invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{invitation.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Role: {invitation.role} • Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => deleteInvitation(invitation.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
