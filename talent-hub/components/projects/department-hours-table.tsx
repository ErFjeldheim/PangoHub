import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Clock, Trash2 } from "lucide-react";

interface DepartmentHour {
  department_id: string;
  department_name: string;
  hours_required: number;
}

interface DepartmentHoursTableProps {
  projectId: string;
  deptHours: DepartmentHour[];
  allDepartments?: Array<{ id: string; name: string }> | null;
  isAdmin: boolean;
  upsertAction: (formData: FormData) => Promise<void>;
  removeAction: (formData: FormData) => Promise<void>;
}

export function DepartmentHoursTable({
  projectId,
  deptHours,
  allDepartments,
  isAdmin,
  upsertAction,
  removeAction,
}: DepartmentHoursTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Department Hours
        </CardTitle>
        <CardDescription>Required hours by department</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Hours Required</TableHead>
                {isAdmin && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deptHours.length ? (
                deptHours.map((row) => (
                  <TableRow key={row.department_id}>
                    <TableCell className="font-medium">
                      {row.department_name}
                    </TableCell>
                    <TableCell>{row.hours_required}h</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <form
                            action={upsertAction}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="hidden"
                              name="project_id"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="department_id"
                              value={row.department_id}
                            />
                            <Input
                              name="hours_required"
                              type="number"
                              min={0}
                              defaultValue={row.hours_required}
                              className="w-20 h-8"
                            />
                            <Button size="sm" variant="outline">
                              Save
                            </Button>
                          </form>
                          <form action={removeAction}>
                            <input
                              type="hidden"
                              name="project_id"
                              value={projectId}
                            />
                            <input
                              type="hidden"
                              name="department_id"
                              value={row.department_id}
                            />
                            <Button size="sm" variant="ghost" type="submit">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={isAdmin ? 3 : 2}
                    className="text-center text-muted-foreground"
                  >
                    No department hours configured yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {isAdmin && allDepartments && (
          <form
            action={upsertAction}
            className="flex flex-wrap items-end gap-3 pt-4 border-t"
          >
            <input type="hidden" name="project_id" value={projectId} />
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="department_id">Department</Label>
              <Select name="department_id">
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {allDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Label htmlFor="hours_required">Hours</Label>
              <Input
                id="hours_required"
                name="hours_required"
                type="number"
                min={0}
                placeholder="80"
                className="mt-1.5"
              />
            </div>
            <Button type="submit">Add / Update</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
