// types/profile.ts
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
  display_name: string; // from your DB
  email: string | null; // from v_profiles_with_email
};

export type CurrentProfile = Profile & {
  is_admin: boolean;
};
