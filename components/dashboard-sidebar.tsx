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
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/pocketbase";
import type { User as PBUser } from "@/types/pocketbase";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SidebarContentProps {
  user: PBUser;
  profile: PBUser & { is_admin: boolean };
  className?: string;
  onLinkClick?: () => void;
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

export function SidebarContent({
  user,
  profile,
  className,
  onLinkClick,
}: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pb = createClient();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    pb.authStore.clear();
    document.cookie = "pb_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/auth/login");
  };

  const isAdmin = !!profile.is_admin;

  const navBase = [
    {
      name: t.nav.dashboard,
      href: "/dashboard",
      icon: Home,
      current: pathname === "/dashboard",
    },
    {
      name: t.nav.myProfile,
      href: "/dashboard/profile",
      icon: User,
      current: pathname.startsWith("/dashboard/profile"),
    },
    {
      name: t.nav.consultants,
      href: "/dashboard/consultants",
      icon: Users,
      current: pathname.startsWith("/dashboard/consultants"),
    },
    {
      name: t.nav.projects,
      href: "/dashboard/projects",
      icon: Briefcase,
      current: pathname.startsWith("/dashboard/projects"),
    },
  ];

  const navAdmin = isAdmin
    ? [
        {
          name: t.nav.departments,
          href: "/dashboard/departments",
          icon: Building,
          current: pathname.startsWith("/dashboard/departments"),
        },
        {
          name: t.nav.inviteUsers,
          href: "/dashboard/invite",
          icon: UserPlus,
          current: pathname.startsWith("/dashboard/invite"),
        },
        {
          name: t.nav.analytics,
          href: "/dashboard/analytics",
          icon: BarChart3,
          current: pathname.startsWith("/dashboard/analytics"),
        },
      ]
    : [];

  const navTail = [
    {
      name: t.nav.settings,
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
    <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
      <div className="flex items-center h-16 px-6 border-b border-border">
        <div className="relative h-10 w-10 rounded-md overflow-hidden shrink-0">
          <Image
            src="/pango_logo.jpeg"
            alt="Pango Logo"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} onClick={onLinkClick}>
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

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {isAdmin ? t.nav.admin : t.nav.member}
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
          {t.nav.signOut}
        </Button>
      </div>
    </div>
  );
}

export function DashboardSidebar({ user, profile }: SidebarContentProps) {
  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
      <SidebarContent user={user} profile={profile} />
    </div>
  );
}
