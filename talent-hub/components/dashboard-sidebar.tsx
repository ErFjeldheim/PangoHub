"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Settings, BarChart3, Home, LogOut, User, Building } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DashboardSidebarProps {
  user: any
  profile: any
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
    },
    {
      name: "My Profile",
      href: "/dashboard/profile",
      icon: User,
      current: pathname === "/dashboard/profile",
    },
    {
      name: "Consultants",
      href: "/dashboard/consultants",
      icon: Users,
      current: pathname.startsWith("/dashboard/consultants"),
    },
    ...(profile.role === "admin"
      ? [
          {
            name: "Departments",
            href: "/dashboard/departments",
            icon: Building,
            current: pathname === "/dashboard/departments",
          },
          {
            name: "Invite Users",
            href: "/dashboard/invite",
            icon: UserPlus,
            current: pathname === "/dashboard/invite",
          },
          {
            name: "Analytics",
            href: "/dashboard/analytics",
            icon: BarChart3,
            current: pathname === "/dashboard/analytics",
          },
        ]
      : []),
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname === "/dashboard/settings",
    },
  ]

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Pango Talent Hub</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "secondary" : "ghost"}
                className={cn("w-full justify-start", item.current && "bg-secondary text-secondary-foreground")}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {profile.first_name?.[0]}
              {profile.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{profile.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
