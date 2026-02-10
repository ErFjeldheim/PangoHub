import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

export type Availability = {
  month: string;
  hours_available: number;
  hours_committed: number;
  hours_free: number;
  status: "available" | "partly" | "busy" | "unavailable";
};

function getStatusColor(status: Availability["status"]) {
  switch (status) {
    case "available":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20";
    case "partly":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20";
    case "busy":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20";
    case "unavailable":
      return "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20";
  }
}

function getUtilizationColor(utilization: number) {
  if (utilization >= 90) return "bg-red-500";
  if (utilization >= 70) return "bg-orange-500";
  if (utilization >= 50) return "bg-amber-500";
  return "bg-emerald-500";
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
    <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-xl">Availability</CardTitle>
        </div>
        <Badge className={getStatusColor(status)}>
          {status[0].toUpperCase() + status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{monthLabel}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1 p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground font-medium">
              Available
            </div>
            <div className="text-lg font-semibold text-foreground">
              {hours_available}h
            </div>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground font-medium">
              Committed
            </div>
            <div className="text-lg font-semibold text-foreground">
              {hours_committed}h
            </div>
          </div>
          <div className="space-y-1 p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground font-medium">
              Free
            </div>
            <div className="text-lg font-semibold text-foreground">
              {hours_free}h
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">
              Utilization
            </span>
            <span className="font-semibold text-foreground">
              {utilization}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${getUtilizationColor(
                utilization
              )}`}
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
