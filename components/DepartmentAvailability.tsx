import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DepartmentAvailabilityProps {
  departmentName: string;
  availableConsultants: number;
  totalConsultants: number;
}

export function DepartmentAvailability({ departmentName, availableConsultants, totalConsultants }: DepartmentAvailabilityProps) {
  const availabilityPercentage = totalConsultants > 0 ? (availableConsultants / totalConsultants) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{departmentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Availability</span>
          <span className="font-semibold">{availableConsultants} / {totalConsultants}</span>
        </div>
        <Progress value={availabilityPercentage} className="mt-2" />
      </CardContent>
    </Card>
  );
}