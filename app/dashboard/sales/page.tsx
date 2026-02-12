import { requireSalesAccess } from "@/lib/auth/server-auth";
import { getSalesLeads } from "@/app/actions/sales";
import { SalesLeadList } from "@/components/sales/SalesLeadList";
import { SalesLeadForm } from "@/components/sales/SalesLeadForm";

export default async function SalesPage() {
  await requireSalesAccess();
  const leads = await getSalesLeads();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales & Resource Planning</h1>
          <p className="text-muted-foreground">
            Create mock projects to evaluate consultant availability and skills.
          </p>
        </div>
        <SalesLeadForm />
      </div>

      <SalesLeadList leads={leads} />
    </div>
  );
}
