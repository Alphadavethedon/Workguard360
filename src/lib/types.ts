export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  department: string;
  jobTitle: string;
  phone?: string;
  emergencyContact?: string;
  badgeNumber: string;
  accessLevel: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: Permission[];
  accessLevel: number;
  isCustom: boolean;
  createdAt: string;
}

export interface Permission {
  _id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Alert {
  _id: string;
  type: 'security' | 'compliance' | 'system' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  location: string;
  triggeredBy: string;
  assignedTo?: User;
  acknowledgedBy?: User;
  resolvedBy?: User;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface Report {
  _id: string;
  name: string;
  type: 'access' | 'compliance' | 'security' | 'attendance' | 'system' | 'custom';
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  generatedBy: User;
  status: 'generating' | 'ready' | 'failed' | 'expired';
  format: 'pdf' | 'csv' | 'excel' | 'json';
  filePath?: string;
  fileSize?: number;
  downloadCount: number;
  createdAt: string;
  downloadUrl?: string;
}

export interface Shift {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  roles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Floor {
  _id: string;
  name: string;
  level: number;
  description: string;
  accessRoles: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalAlerts: number;
  criticalAlerts: number;
  todayEntries: number;
  complianceScore: number;
  systemHealth: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}