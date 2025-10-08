import { getProfile } from "@/lib/actions/profile";
import DepartmentList from "@/components/DepartmentList";
import { redirect } from "next/navigation";

const DepartmentsPage = async () => {
  const { profile } = await getProfile();

  if (profile.role !== "admin") {
    // Or show a more friendly "Not Authorized" page
    return redirect("/dashboard");
  }

  return (
    <div className="p-6">
      <DepartmentList />
    </div>
  );
};

export default DepartmentsPage;
