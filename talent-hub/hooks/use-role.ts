"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Profile {
  id: string
  role: "admin" | "consultant"
  first_name: string
  last_name: string
  email: string
}

export function useRole() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setProfile(null)
          return
        }

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          setError(error.message)
          return
        }

        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }

    getProfile()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      getProfile()
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const isAdmin = profile?.role === "admin"
  const isConsultant = profile?.role === "consultant"
  const hasRole = (role: "admin" | "consultant") => profile?.role === role

  return {
    profile,
    isLoading,
    error,
    isAdmin,
    isConsultant,
    hasRole,
  }
}
