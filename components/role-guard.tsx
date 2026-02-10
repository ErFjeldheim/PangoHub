"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/pocketbase"
import { useRouter } from "next/navigation"
import { User } from "@/types/pocketbase"

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({ children, allowedRoles, fallback, redirectTo = "/dashboard" }: RoleGuardProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pb = createClient()

  useEffect(() => {
    const checkRole = () => {
        const user = pb.authStore.record as User | null
        
        if (!user) {
            router.push("/auth/login")
            return
        }

        const hasPermission = allowedRoles.includes(user.role || '')
        setIsAuthorized(hasPermission)

        if (!hasPermission && redirectTo) {
            router.push(redirectTo)
        }
        setIsLoading(false)
    }

    checkRole()
    
    const unsubscribe = pb.authStore.onChange(() => {
        checkRole()
    })

    return () => unsubscribe()
  }, [allowedRoles, redirectTo, router, pb.authStore])

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
