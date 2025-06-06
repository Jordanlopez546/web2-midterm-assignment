export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  roleId: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  roleName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    recentUsers: number;
  };
  usersByRole: { [key: string]: number };
  registrationTrend: Array<{ _id: string; count: number }>;
}