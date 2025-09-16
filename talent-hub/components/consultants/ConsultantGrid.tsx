"use client";

import type { Consultant } from "@/types/consultant";
import { ConsultantCard } from "./ConsultantCard";

export function ConsultantGrid({ consultants }: { consultants: Consultant[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {consultants.map((c) => (
        <ConsultantCard key={c.id} consultant={c} />
      ))}
    </div>
  );
}
