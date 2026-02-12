// app/(dashboard)/departments/[id]/page.tsx
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDepartmentDetails } from "@/app/actions/departments";
import { getConsultantsForDepartment, searchConsultants } from "@/app/actions/consultants";
import { getProjectsForDepartment } from "@/app/actions/projects";
import { getAggregatedAvailabilityForDepartment } from "@/app/actions/availability";
import { DepartmentConsultantList } from "@/components/DepartmentConsultantList";
import { DepartmentAvailability } from "@/components/DepartmentAvailability";
import DepartmentProjectList from "@/components/DepartmentProjectList";
import DepartmentSettings from "@/components/DepartmentSettings";
import DepartmentAvailabilityTrend from "@/components/DepartmentAvailabilityTrend";

type PageProps = { params: Promise<{ id: string }> };

export default async function DepartmentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const [department, consultants, projects, availability, allConsultants] = await Promise.all([
    getDepartmentDetails(id),
    getConsultantsForDepartment(id),
    getProjectsForDepartment(id),
    getAggregatedAvailabilityForDepartment(id),
    searchConsultants(""),
  ]);

  console.log("availability", availability);
  console.log("projects", projects);
  console.log("consultants", consultants);
  console.log("department", department);

  if (!department) notFound();

  const totalConsultants = consultants.length;
  const availableConsultants = consultants.filter(
    (c: { availability_status: string | null }) => c.availability_status === "available"
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
        <p className="text-muted-foreground">{department.description ?? ""}</p>
      </div>

      <Tabs defaultValue="consultants">
        <TabsList>
          <TabsTrigger value="consultants">Consultants</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="consultants" className="pt-6">
          <DepartmentConsultantList consultants={consultants} />
        </TabsContent>

        <TabsContent value="projects" className="pt-6">
          <DepartmentProjectList projects={projects} />
        </TabsContent>

        <TabsContent value="availability" className="pt-6">
          <DepartmentAvailability
            departmentName={department.name}
            availableConsultants={availableConsultants}
            totalConsultants={totalConsultants}
          />

          <div className="mt-6">
            <DepartmentAvailabilityTrend
              departmentName={department.name}
              data={availability}
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="pt-6">
          <DepartmentSettings
            department={department}
            consultants={allConsultants}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
