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
  title: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
  display_name: string;
  email: string | null;
  availability_status: AvailabilityStatus | null;
  experience_years: number | null;
  primary_department: string | null;
};

export type Skill = {
  proficiency: number;
  years: number;
  skills: { name: string };
};

export type Experience = {
  id: string;
  profile_id: string;
  org: string;
  role: string;
  start_date: string;
  end_date: string | null;
  type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Education = {
  id: string;
  profile_id: string;
  institution: string;
  program: string | null;
  degree_level: string | null;
  start_year: number | null;
  end_year: number | null;
  created_at: string;
  updated_at: string;
};
