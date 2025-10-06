export type Consultant = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
  title?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  location?: string | null;
  availability_status?: "available" | "partly" | "busy" | "unavailable" | null;
  experience_years?: number | null;
  rank?: number | null;
};
