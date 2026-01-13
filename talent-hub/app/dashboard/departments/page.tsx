// app/(dashboard)/departments/page.tsx
import DepartmentsInformation from "@/components/DepartmentsInformation";
import { requireAdmin } from "@/lib/auth/server-auth";

export default async function DepartmentsPage() {
  // Will redirect to /dashboard if the current user isn't an admin
  await requireAdmin();

  return (
    <div className="p-6">
      <DepartmentsInformation />
    </div>
  );
}
