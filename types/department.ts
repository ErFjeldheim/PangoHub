export type Department = {
  id: string;
  name: string;
  description: string;
  consultant_count: number;
  leader_name: string;
};

export type DepartmentDetails = {
  id: string;
  name: string;
  description: string | null;
  consultant_count: number;
  leader_name: string | null;
  leader_profile_id?: string | null; // Optional if you want the raw id too
};
