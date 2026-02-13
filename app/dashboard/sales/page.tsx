"use client";

import { getSalesLeads, SalesLead } from "@/app/actions/sales";
import { SalesLeadList } from "@/components/sales/SalesLeadList";
import { SalesLeadForm } from "@/components/sales/SalesLeadForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useEffect, useState } from "react";

export default function SalesPage() {
  const { t } = useLanguage();
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSalesLeads();
        setLeads(data);
      } catch (err) {
        console.error("Failed to load sales leads:", err);
        setError("Failed to load sales leads. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center">{t.common.loading}</div>;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

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
