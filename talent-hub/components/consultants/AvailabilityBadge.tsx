"use client";

import { Badge } from "@/components/ui/badge";

const statusClass: Record<string, string> = {
  available: "bg-green-500/10 text-green-500 border-green-500/20",
  partly: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  busy: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  unavailable: "bg-red-500/10 text-red-500 border-red-500/20",
  default: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function AvailabilityBadge({ status }: { status?: string | null }) {
  if (!status) return null;
  const cls = statusClass[status] ?? statusClass.default;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant="outline" className={cls}>
      {label}
    </Badge>
  );
}
