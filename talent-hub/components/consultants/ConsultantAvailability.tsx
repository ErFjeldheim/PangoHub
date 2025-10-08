// components/consultants/ConsultantAvailability.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type Availability = {
  month: string; // ISO date string
  hours_available: number;
  hours_committed: number;
  hours_free: number;
  status: "available" | "partly" | "busy" | "unavailable";
};

function getStatusColor(status: Availability["status"]) {
  switch (status) {
    case "available":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "partly":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "busy":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "unavailable":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
}

export function ConsultantAvailability({
  availability,
}: {
  availability: Availability | null;
}) {
  if (!availability) return null;

  const { month, hours_available, hours_committed, hours_free, status } =
    availability;
  const monthLabel = new Date(month).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });
  const utilization =
    hours_available > 0
      ? Math.min(100, Math.round((hours_committed / hours_available) * 100))
      : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Availability</CardTitle>
        <Badge className={getStatusColor(status)}>
          {status[0].toUpperCase() + status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">{monthLabel}</div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-muted-foreground">Available</div>
            <div className="font-medium">{hours_available}h</div>
          </div>
          <div>
            <div className="text-muted-foreground">Committed</div>
            <div className="font-medium">{hours_committed}h</div>
          </div>
          <div>
            <div className="text-muted-foreground">Free</div>
            <div className="font-medium">{hours_free}h</div>
          </div>
        </div>

        {/* Utilization bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Utilization</span>
            <span>{utilization}%</span>
          </div>
          <div className="h-2 w-full rounded bg-muted overflow-hidden">
            <div
              className="h-2 rounded bg-primary transition-all"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
