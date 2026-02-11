"use client";

import ConsultantSearch from "./consultants/ConsultantSearch";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { SidebarContent } from "./dashboard-sidebar";
import type { User as PBUser } from "@/types/pocketbase";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DashboardHeaderProps {
  user: PBUser;
  profile: PBUser & { is_admin: boolean };
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t.header.toggleMenu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Main navigation menu</SheetDescription>
              <SidebarContent 
                user={user} 
                profile={profile} 
                onLinkClick={() => setOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-4">
          <ConsultantSearch />
          <LanguageToggle />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
