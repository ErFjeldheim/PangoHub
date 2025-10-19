import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function OpenRoles({
  rows,
}: {
  rows: Array<{ department_name: string; remaining_hours: number }>;
}) {
  const list = rows.filter((r) => r.remaining_hours > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {list.length ? (
          list.map((r) => (
            <div
              key={r.department_name}
              className="flex items-center justify-between rounded border p-3"
            >
              <div className="font-medium">{r.department_name}</div>
              <Badge variant="secondary">{r.remaining_hours}h needed</Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No remaining hours right now
          </p>
        )}
      </CardContent>
    </Card>
  );
}
