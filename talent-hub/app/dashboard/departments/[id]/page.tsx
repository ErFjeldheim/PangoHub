import { notFound } from 'next/navigation';
import { getDepartmentDetails, getConsultantsForDepartment, getProjectsForDepartment, getAggregatedAvailabilityForDepartment } from '@/app/actions/departments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DepartmentConsultantList from '@/components/DepartmentConsultantList';
import DepartmentProjectList from '@/components/DepartmentProjectList';
import DepartmentAvailability from '@/components/DepartmentAvailability';
import DepartmentSettings from '@/components/DepartmentSettings';

type PageProps = {
  params: { id: string };
};

export default async function DepartmentDetailPage({ params }: PageProps) {
  const { id } = params;

  // Fetch in parallel for speed
  const [department, consultants, projects, availability] = await Promise.all([
    getDepartmentDetails(id),
    getConsultantsForDepartment(id),
    getProjectsForDepartment(id),
    getAggregatedAvailabilityForDepartment(id),
  ]);

  if (!department) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{department.name}</h1>
        <p className="text-muted-foreground">{department.description}</p>
      </div>

      <Tabs defaultValue="consultants">
        <TabsList>
          <TabsTrigger value="consultants">Consultants</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="consultants" className="pt-6">
          <DepartmentConsultantList
            departmentId={department.id}
            initialConsultants={consultants}
          />
        </TabsContent>
        <TabsContent value="projects" className="pt-6">
          <DepartmentProjectList projects={projects} />
        </TabsContent>
        <TabsContent value="availability" className="pt-6">
          <DepartmentAvailability availability={availability} />
        </TabsContent>
        <TabsContent value="settings" className="pt-6">
          <DepartmentSettings department={department} consultants={consultants} />
        </TabsContent>
      </Tabs>
    </div>
  );
}