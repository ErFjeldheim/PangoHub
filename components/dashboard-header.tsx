"use client";

import ConsultantSearch from "./consultants/ConsultantSearch";

export function DashboardHeader() {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center justify-between h-full px-6">
        <ConsultantSearch />
      </div>
    </header>
  );
}
