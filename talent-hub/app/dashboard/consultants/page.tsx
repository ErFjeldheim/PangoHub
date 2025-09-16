"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConsultantSearch } from "@/components/ConsultantSearch";
import { searchConsultants } from "@/lib/actions/consultants";
import { ConsultantGrid } from "@/components/consultants/ConsultantGrid";
import { ConsultantEmptyState } from "@/components/consultants/ConsultantEmptyState";
import type { Consultant } from "@/types/consultant";

export default function ConsultantsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      const results = await searchConsultants("");
      setConsultants(results);
      setIsLoading(false);
    };
    run();
  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    const results = await searchConsultants(query);
    setConsultants(results);
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Consultants</h1>
          <p className="text-muted-foreground">
            Manage your consultant network
          </p>
        </div>
        <Link href="/dashboard/invite">
          <Button>Invite Consultant</Button>
        </Link>
      </div>

      <ConsultantSearch onSearch={handleSearch} />

      {isLoading ? (
        <p>Loading...</p>
      ) : consultants.length ? (
        <ConsultantGrid consultants={consultants} />
      ) : (
        <ConsultantEmptyState />
      )}
    </div>
  );
}
