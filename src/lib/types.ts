export interface User {
  id: string;
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
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isCustom: boolean;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface Alert {
  id: string;
  type: 'security' | 'compliance' | 'system' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  location: string;
  triggeredBy: string;
  assignedTo?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  badgeNumber: string;
  location: string;
  action: 'entry' | 'exit' | 'denied';
  timestamp: string;
  deviceId: string;
  ipAddress: string;
  success: boolean;
  reason?: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  department: string;
  requiredStaff: number;
  currentStaff: number;
  isActive: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'access' | 'compliance' | 'security' | 'attendance';
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  generatedBy: string;
  status: 'generating' | 'ready' | 'failed';
  downloadUrl?: string;
  createdAt: string;
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