// app/dashboard/layout.tsx
import type React from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { requireAuth, getCurrentProfile } from "@/lib/auth/server-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load your profile. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar user={user} profile={profile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
