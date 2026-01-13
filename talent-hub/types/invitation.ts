// types/invitation.ts
export type Invitation = {
  id: string;
  email: string; // citext in DB -> string here
  role: "admin" | "consultant";
  invited_by: string; // profiles.id (uuid)
  token_hash: string;
  expires_at: string; // timestamptz ISO string
  accepted_at: string | null; // timestamptz
  created_at: string; // timestamptz
};
