import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ConsultantEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-xl border shadow-sm">
      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No consultants found</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Get started by inviting consultants to join your network.
      </p>
      <Link href="/dashboard/invite">
        <Button>Invite Consultant</Button>
      </Link>
    </div>
  );
}
