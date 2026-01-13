interface RecentConsultantItemProps {
  consultant: {
    id: string;
    first_name: string;
    last_name: string;
    title: string;
    availability_status: string;
  };
}

export function RecentConsultantItem({ consultant }: RecentConsultantItemProps) {
  return (
    <div key={consultant.id} className="flex items-center space-x-4">
      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="text-sm font-medium text-primary">
          {consultant.first_name?.[0]}
          {consultant.last_name?.[0]}
        </span>
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">
          {consultant.first_name} {consultant.last_name}
        </p>
        <p className="text-xs text-muted-foreground">
          {consultant.title || "Consultant"}
        </p>
      </div>
      <div className="text-xs text-muted-foreground">
        {consultant.availability_status}
      </div>
    </div>
  );
}