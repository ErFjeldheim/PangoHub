"use client"

import { useEffect, useState } from "react"
import { User } from "@/types/pocketbase"

export function useRole() {
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          setProfile(null)
          return
        }
        const data = await res.json()
        setProfile(data.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
        setProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
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
