import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PendingInvitationItemProps {
  invitation: {
    id: string;
    email: string;
    role: string;
    expires_at: string;
  };
  onDelete: (id: string) => void;
}

export function PendingInvitationItem({ invitation, onDelete }: PendingInvitationItemProps) {
  return (
    <div key={invitation.id} className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{invitation.email}</p>
        <p className="text-xs text-muted-foreground">
          {invitation.role} • Expires{" "}
          {new Date(invitation.expires_at).toLocaleDateString()}
        </p>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onDelete(invitation.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
