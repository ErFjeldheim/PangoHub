// app/dashboard/page.tsx
import { getConsultantHomeData } from "@/app/actions/consultantHome";
import { ConsultantDashboard } from "@/components/ConsultantDashboard";
import { StatCard } from "@/components/StatCard";
import DepartmentsInformation from "@/components/DepartmentsInformation";
import { getConsultants, getProfile, getUser } from "@/app/actions/dashboard";
import { getActiveProjects } from "@/app/actions/projects";
import { Briefcase, Clock, TrendingUp, Users } from "lucide-react";
import type { Consultant } from "@/types/consultant";

export default async function DashboardPage() {
  const data = await getConsultantHomeData();
  if (!data) return null;

  // If admin: keep existing admin view
  if (data.isAdmin) {
    const user = await getUser();
    const profile = await getProfile(user.id);
    const consultants = await getConsultants();
    const activeProjects = await getActiveProjects();

    const availableConsultants =
      consultants?.filter(
        (c: Consultant) => c.availability_status === "available"
      ).length || 0;

    const totalConsultants = consultants?.length || 0;

    const avgExperience =
      consultants && consultants.length > 0
        ? Math.round(
            consultants.reduce(
              (acc, c: Consultant) => acc + (c.experience_years || 0),
              0
            ) / consultants.length
          )
        : 0;

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile.first_name}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your consultant network
            today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Consultants"
            value={totalConsultants}
            description="Active consultant profiles"
            icon={Users}
          />
          <StatCard
            title="Available Now"
            value={availableConsultants}
            description="Ready for new projects"
            icon={TrendingUp}
          />
          <StatCard
            title="Avg. Experience"
            value={`${avgExperience}y`}
            description="Years of experience"
            icon={Clock}
          />
          <StatCard
            title="Active Projects"
            value={activeProjects.length}
            description="Currently running projects"
            icon={Briefcase}
          />
        </div>

        <DepartmentsInformation />
      </div>
    );
  }

  // Default: consultant dashboard
  return (
    <ConsultantDashboard
      displayName={data.displayName}
      completenessPct={data.completenessPct}
      availability={data.availability}
      myProjects={data.myProjects}
      opportunities={data.opportunities}
      primaryDepartmentName={data.primaryDepartmentName}
    />
  );
}
