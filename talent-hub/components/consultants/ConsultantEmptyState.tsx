"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export function ConsultantEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Mail className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium">No consultants found</h3>
            <p className="text-muted-foreground">
              Try a different search or invite new consultants.
            </p>
          </div>
          <Link href="/dashboard/invite">
            <Button>Invite a Consultant</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
