"use client";

import { requireSalesAccess } from "@/lib/auth/server-auth";
import { getSalesLeads, SalesLead } from "@/app/actions/sales";
import { SalesLeadList } from "@/components/sales/SalesLeadList";
import { SalesLeadForm } from "@/components/sales/SalesLeadForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect, useState } from "react";

export default function SalesPage() {
  const { t } = useLanguage();
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const load = async () => {
          const data = await getSalesLeads();
          setLeads(data);
          setLoading(false);
      };
      load();
  }, []);

  if (loading) return <div className="p-8 text-center">{t.common.loading}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.sales.title}</h1>
          <p className="text-muted-foreground">
            {t.sales.subtitle}
          </p>
        </div>
        <SalesLeadForm />
      </div>

      <SalesLeadList leads={leads} />
    </div>
  );
}
