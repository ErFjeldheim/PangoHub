// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import {
  getCurrentUser,
  getCurrentProfile,
  isAdmin,
} from "@/lib/auth/server-auth";
import { searchConsultants } from "@/app/actions/consultants";
import { getActiveProjects } from "@/app/actions/projects";
import {
  ConsultantDashboard,
  getConsultantHomeData,
} from "@/components/consultant-dashboard";

import { StatCard } from "@/components/StatCard";
import DepartmentsInformation from "@/components/DepartmentsInformation";
import { Briefcase, Clock, TrendingUp, Users } from "lucide-react";

export default async function DashboardPage() {
  // Require auth
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  // If admin: render the admin dashboard
  if (await isAdmin(user.id)) {
    const profile = await getCurrentProfile(); // current user’s profile (for greeting)
    const [consultants, activeProjects] = await Promise.all([
      searchConsultants(""), // empty query => all consultants (typed)
      getActiveProjects(),
    ]);

    const availableConsultants = consultants.filter(
      (c) => c.availability_status === "available"
    ).length;

    const totalConsultants = consultants.length;

    const avgExperience =
      consultants.length > 0
        ? Math.round(
            consultants.reduce((acc, c) => acc + (c.experience_years ?? 0), 0) /
              consultants.length
          )
        : 0;

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {profile?.first_name ?? "Admin"}
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
  const data = await getConsultantHomeData();
  if (!data) return null;

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
