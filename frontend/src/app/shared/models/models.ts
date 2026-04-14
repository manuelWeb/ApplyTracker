export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface Application {
  id: string;
  position: string;
  status: ApplicationStatus;
  location?: string;
  notes?: string;
  appliedDate?: string;
  companyId?: string;
  company?: Company;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
}
