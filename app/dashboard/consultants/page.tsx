"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { searchConsultants } from "@/app/actions/consultants";
import { ConsultantGrid } from "@/components/consultants/ConsultantGrid";
import { ConsultantEmptyState } from "@/components/consultants/ConsultantEmptyState";
import type { Consultant } from "@/types/consultant";
import { UserPlus, Users } from "lucide-react";

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Consultants</h1>
          </div>
          <p className="text-muted-foreground">
            Manage and connect with your consultant network
          </p>
        </div>
        <Link href="/dashboard/invite">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Consultant
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading consultants...
            </p>
          </div>
        </div>
      ) : consultants.length ? (
        <ConsultantGrid consultants={consultants} />
      ) : (
        <ConsultantEmptyState />
      )}
    </div>
  );
}
