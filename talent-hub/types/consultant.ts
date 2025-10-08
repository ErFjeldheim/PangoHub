// types/consultant.ts
export type AvailabilityStatus =
  | "available"
  | "partly"
  | "busy"
  | "unavailable";

export type Consultant = {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  title?: string | null;
  bio?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;

  // from v_consultant_overview (or wherever you select it)
  availability_status?: AvailabilityStatus | null;
  experience_years?: number | null;

  // optionally, if you sometimes alias it to "status" in queries:
  // status?: AvailabilityStatus | null;
};
