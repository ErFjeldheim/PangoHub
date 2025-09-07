"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: ("admin" | "consultant")[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({ children, allowedRoles, fallback, redirectTo = "/dashboard" }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkRole = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        if (!profile) {
          router.push("/auth/login")
          return
        }

        const hasPermission = allowedRoles.includes(profile.role as "admin" | "consultant")
        setIsAuthorized(hasPermission)

        if (!hasPermission && redirectTo) {
          router.push(redirectTo)
        }
      } catch (error) {
        console.error("Role check failed:", error)
        setIsAuthorized(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkRole()
  }, [allowedRoles, redirectTo, router, supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return fallback || null
  }

  return <>{children}</>
}
