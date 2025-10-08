import { Badge } from "@/components/ui/badge";

type AvailabilityStatus = "available" | "partly" | "busy" | "unavailable";

function getStatusColor(status?: AvailabilityStatus) {
  switch (status) {
    case "available":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "partly":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "busy":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "unavailable":
      return "bg-red-500/10 text-red-600 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
}

export function AvailabilityBadge({ status }: { status?: AvailabilityStatus }) {
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

  return (
    <Badge className={`${getStatusColor(status)} text-xs font-medium`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {label}
    </Badge>
  );
}
