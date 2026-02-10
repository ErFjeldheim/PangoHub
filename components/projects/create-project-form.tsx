import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface CreateProjectFormProps {
  action: (formData: FormData) => Promise<void>;
  clients?: Array<{ id: string; name: string }> | null;
}

export function CreateProjectForm({ action, clients }: CreateProjectFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Add a new project to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Enter project name"
              className="mt-1.5"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief project description"
              className="mt-1.5"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="client_id">Client</Label>
            <Select name="client_id">
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select client (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No client</SelectItem>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="active">
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              name="start_date"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              name="end_date"
              className="mt-1.5"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" size="lg">
              Create Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
