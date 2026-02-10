// types/project.ts

export type ProjectStatus = "planned" | "active" | "completed" | "on_hold";

export interface ProjectOverview {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  client_name: string | null;
  consultant_count: number;
  departments: string[] | null;
  first_member_start: string | null;
  last_member_end: string | null;
  is_active: boolean;
  duration_days: number | null;
}

export interface ProjectDetailMember {
  profile_id: string;
  display_name: string;
  title: string | null;
  role: string | null;
  hours: number | null;
  start_date: string | null;
  end_date: string | null;
  contribution: string | null;
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  client_name: string | null;
  skills: { id: string; name: string }[];
  members: ProjectDetailMember[];
}

export interface DepartmentProject {
  id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProjectStatus;
  client_name: string | null;
}

export interface DepartmentHour {
  department_id: string;
  department_name: string;
  hours_required: number;
}

export interface ProjectUpdate {
  id: string;
  title: string | null;
  body: string | null;
  created_at: string;
  author: { id: string; display_name: string | null } | null;
}

export interface Applicant {
  profile_id: string;
  display_name: string;
  title: string | null;
  message: string | null;
  created_at: string;
}
