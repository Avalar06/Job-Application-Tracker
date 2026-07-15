export interface AppRoute {
  path: string;
  label: string;
  element: React.ReactNode;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Application {
  id: number;
  user_id: number;
  company_name: string;
  job_title: string;
  status: string;
  location?: string | null;
  job_url?: string | null;
  salary?: string | null;
  applied_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationCreate {
  company_name: string;
  job_title: string;
  status: string;
  location?: string | null;
  job_url?: string | null;
  salary?: string | null;
  applied_date?: string | null;
  notes?: string | null;
}

export interface ApplicationUpdate {
  company_name?: string | null;
  job_title?: string | null;
  status?: string | null;
  location?: string | null;
  job_url?: string | null;
  salary?: string | null;
  applied_date?: string | null;
  notes?: string | null;
}
