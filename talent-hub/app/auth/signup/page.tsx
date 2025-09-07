"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [invitation, setInvitation] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const validateInvitation = async () => {
      if (!token) {
        setError("Invalid invitation link")
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("token", token)
        .gt("expires_at", new Date().toISOString())
        .is("accepted_at", null)
        .single()

      if (error || !data) {
        setError("Invalid or expired invitation")
        return
      }

      setInvitation(data)
      setEmail(data.email)
    }

    validateInvitation()
  }, [token])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitation) return

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: invitation.role,
          },
        },
      })

      if (signUpError) throw signUpError

      // Mark invitation as accepted
      await supabase.from("invitations").update({ accepted_at: new Date().toISOString() }).eq("token", token)

      router.push("/auth/signup-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (!invitation && !error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Validating invitation...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join Pango Talent Hub</CardTitle>
            <CardDescription>Complete your registration as a {invitation?.role}</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center space-y-4">
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
