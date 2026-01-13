// app/actions/accessRequests.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { createInvitation } from "@/app/actions/invitations";

export type AccessRequest = {
  id: string;
  email: string;
  name: string | null;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export async function createAccessRequest(input: {
  email: string;
  name: string;
  message: string;
}) {
  const supabase = await createClient();

  const email = input.email.trim();
  const name = input.name.trim();
  const message = input.message.trim();

  if (!email || !name || !message) throw new Error("All fields are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Please enter a valid email address.");

  const { error } = await supabase
    .from("access_requests")
    .insert({ email, name, message }); // <-- no .select()

  if (error) {
    console.error("access_requests insert error:", error);
    // if you later add a unique pending index, you can special-case code 23505 here
    throw new Error("Could not submit your request. Please try again.");
  }

  return { ok: true }; // no id needed
}

/** Admin: list pending access requests (RLS enforces is_admin) */
export async function getPendingAccessRequests(): Promise<AccessRequest[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("access_requests")
    .select("id, email, name, message, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPendingAccessRequests error:", error);
    throw new Error("Failed to fetch access requests.");
  }
  return data as AccessRequest[];
}

/** Admin: approve request -> create invitation + mark approved */
export async function approveAccessRequest(
  id: string,
  role: "consultant" | "admin" = "consultant"
) {
  const supabase = await createClient();

  // fetch request (optional, but nice to validate)
  const { data: req, error: fetchErr } = await supabase
    .from("access_requests")
    .select("id,email,status")
    .eq("id", id)
    .single();

  if (fetchErr || !req) throw new Error("Request not found.");
  if (req.status !== "pending") throw new Error("Request is not pending.");

  // create invitation (uses current admin user as invited_by; RLS applies)
  const { inviteUrl } = await createInvitation(req.email, role);

  // mark approved
  const { error: updErr } = await supabase
    .from("access_requests")
    .update({ status: "approved", decided_at: new Date().toISOString() })
    .eq("id", id);

  if (updErr) {
    console.error("approveAccessRequest update error:", updErr);
    throw new Error("Failed to mark request approved.");
  }

  return { inviteUrl };
}

/** Admin: reject request */
export async function rejectAccessRequest(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("access_requests")
    .update({ status: "rejected", decided_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("rejectAccessRequest error:", error);
    throw new Error("Failed to reject request.");
  }

  return { ok: true };
}
