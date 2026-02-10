import { ConsultantCard } from "@/components/consultants/ConsultantCard";
import { Consultant } from "@/types/consultant";

interface DepartmentConsultantListProps {
  consultants: Consultant[];
}

export function DepartmentConsultantList({ consultants }: DepartmentConsultantListProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {consultants.map((consultant) => (
        <ConsultantCard key={consultant.id} consultant={consultant} />
      ))}
    </div>
  );
}