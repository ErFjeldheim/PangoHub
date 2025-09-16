export type Consultant = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  title?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  location?: string | null;
  status?: "available" | "partly" | "busy" | "unavailable" | null;
};
