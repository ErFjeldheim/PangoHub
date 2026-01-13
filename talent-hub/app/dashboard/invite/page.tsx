// app/dashboard/invite/page.tsx
import InviteClient from "@/components/InviteClient";
import { getInvitations } from "@/app/actions/invitations";
import { getPendingAccessRequests } from "@/app/actions/accessRequest";

export default async function InvitePage() {
  const [invitations, accessRequests] = await Promise.all([
    getInvitations(),
    getPendingAccessRequests(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invite Users</h1>
        <p className="text-muted-foreground">
          Manage invitations and review access requests.
        </p>
      </div>

      <InviteClient
        initialInvitations={invitations}
        initialAccessRequests={accessRequests}
      />
    </div>
  );
}
