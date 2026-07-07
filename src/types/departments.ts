export type Department = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  manager_id: string | null;
  is_archived: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  manager?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  } | null;
  member_count?: number;
};

export type CreateDepartmentInput = {
  name: string;
  description?: string;
  manager_id?: string;
};

export type UpdateDepartmentInput = {
  name?: string;
  description?: string;
  manager_id?: string | null;
};
