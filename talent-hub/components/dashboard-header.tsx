"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConsultantSearch from "./ConsultantSearch";

interface DashboardHeaderProps {
  user: any;
  profile: any;
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center justify-between h-full px-6">
        <ConsultantSearch />
      </div>
    </header>
  );
}
