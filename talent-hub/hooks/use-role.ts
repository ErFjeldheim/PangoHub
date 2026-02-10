"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/pocketbase"
import { User } from "@/types/pocketbase"

export function useRole() {
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pb = createClient()

  useEffect(() => {
    setProfile(pb.authStore.record as User | null)
    setIsLoading(false)

    const unsubscribe = pb.authStore.onChange((token, model) => {
        setProfile(model as User | null)
    })

    return () => {
        unsubscribe()
    }
  }, [])

  const isAdmin = profile?.role === "admin"
  const isConsultant = profile?.role === "consultant"
  const hasRole = (role: string) => profile?.role === role

  return {
    profile,
    isLoading,
    error,
    isAdmin,
    isConsultant,
    hasRole,
  }
}
