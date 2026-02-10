export type AdminUser = {
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
  email: string | null; // comes from admin view/function, not profiles table
  is_admin: boolean; // derived from admin_members
};
