// components/dashboard-sidebar.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Settings,
  BarChart3,
  Home,
  LogOut,
  User,
  Building,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/pocketbase";
import type { User as PBUser } from "@/types/pocketbase";

interface DashboardSidebarProps {
  user: PBUser;
  profile: PBUser & { is_admin: boolean };
}

function getInitials(
  displayName?: string | null,
  first?: string | null,
  last?: string | null
) {
  const name = (displayName ?? `${first ?? ""} ${last ?? ""}`).trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  return initials || "U";
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pb = createClient();

  const handleSignOut = async () => {
    pb.authStore.clear();
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/auth/login");
  };

  const isAdmin = !!profile.is_admin;

  const navBase = [
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
      current: pathname.startsWith("/dashboard/profile"),
    },
    {
      name: "Consultants",
      href: "/dashboard/consultants",
      icon: Users,
      current: pathname.startsWith("/dashboard/consultants"),
    },
    {
      name: "Projects",
      href: "/dashboard/projects",
      icon: Briefcase,
      current: pathname.startsWith("/dashboard/projects"),
    },
  ];

  const navAdmin = isAdmin
    ? [
        {
          name: "Departments",
          href: "/dashboard/departments",
          icon: Building,
          current: pathname.startsWith("/dashboard/departments"),
        },
        {
          name: "Invite Users",
          href: "/dashboard/invite",
          icon: UserPlus,
          current: pathname.startsWith("/dashboard/invite"),
        },
        {
          name: "Analytics",
          href: "/dashboard/analytics",
          icon: BarChart3,
          current: pathname.startsWith("/dashboard/analytics"),
        },
      ]
    : [];

  const navTail = [
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      current: pathname.startsWith("/dashboard/settings"),
    },
  ];

  const navigation = [...navBase, ...navAdmin, ...navTail];

  const initials = getInitials(
    profile.display_name,
    profile.first_name,
    profile.last_name
  );
  const fullName =
    profile.display_name ||
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "User";

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border">
      <div className="flex items-center h-16 px-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">Pango Talent Hub</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={item.current ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  item.current && "bg-secondary text-secondary-foreground"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? "Admin" : "Member"}
            </p>
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
  );
}
