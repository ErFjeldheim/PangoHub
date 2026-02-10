// app/actions/accessRequests.ts
"use server";

import { createServerClient } from "@/lib/pocketbase-server";
import { createInvitation } from "@/app/actions/invitations";
import type { AccessRequest as PBAccessRequest } from "@/types/pocketbase";

export type AccessRequest = {
  id: string;
  email: string;
  name: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

function mapToAccessRequest(record: PBAccessRequest): AccessRequest {
    return {
        id: record.id,
        email: record.email,
        name: record.name || null,
        message: record.message || null,
        status: record.status as "pending" | "approved" | "rejected",
        created_at: record.created,
    }
}

export async function createAccessRequest(input: {
  email: string;
  name: string;
  message: string;
}) {
  const pb = await createServerClient();

  const email = input.email.trim();
  const name = input.name.trim();
  const message = input.message.trim();

  if (!email || !name || !message) throw new Error("All fields are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Please enter a valid email address.");

  try {
      await pb.collection("access_requests").create({
          email,
          name,
          message,
          status: 'pending'
      });
  } catch (err) {
      const e = err as Error;
      console.error("access_requests insert error:", e);
      throw new Error("Could not submit your request. Please try again.");
  }

  return { ok: true };
}

export async function getPendingAccessRequests(): Promise<AccessRequest[]> {
  const pb = await createServerClient();
  try {
      const records = await pb.collection("access_requests").getFullList<PBAccessRequest>({
          filter: 'status="pending"',
          sort: '-created'
      });
      return records.map(mapToAccessRequest);
  } catch (e) {
      console.error("getPendingAccessRequests error:", e);
      throw new Error("Failed to fetch access requests.");
  }
}

export async function approveAccessRequest(
  id: string,
  role: "consultant" | "admin" = "consultant"
) {
  const pb = await createServerClient();

  let req: PBAccessRequest;
  try {
      req = await pb.collection("access_requests").getOne<PBAccessRequest>(id);
  } catch {
      throw new Error("Request not found.");
  }

  if (req.status !== "pending") throw new Error("Request is not pending.");

  const { inviteUrl } = await createInvitation(req.email, role);

  try {
      await pb.collection("access_requests").update(id, {
          status: "approved",
          decided_at: new Date().toISOString(),
          decided_by: pb.authStore.record?.id
      });
  } catch (e) {
      console.error("approveAccessRequest update error:", e);
      throw new Error("Failed to mark request approved.");
  }

  return { inviteUrl };
}

export async function rejectAccessRequest(id: string) {
  const pb = await createServerClient();

  try {
      await pb.collection("access_requests").update(id, {
          status: "rejected",
          decided_at: new Date().toISOString(),
          decided_by: pb.authStore.record?.id
      });
  } catch (e) {
      console.error("rejectAccessRequest error:", e);
      throw new Error("Failed to reject request.");
  }

  return { ok: true };
}
