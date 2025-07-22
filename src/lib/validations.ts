import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  roleId: z.string().min(1, 'Role is required'),
  department: z.string().min(2, 'Department is required'),
  jobTitle: z.string().min(2, 'Job title is required'),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  badgeNumber: z.string().min(3, 'Badge number must be at least 3 characters'),
  accessLevel: z.number().min(1).max(10),
});

export const generateReportSchema = z.object({
  name: z.string().min(3, 'Report name must be at least 3 characters'),
  type: z.enum(['access', 'compliance', 'security', 'attendance']),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type GenerateReportFormData = z.infer<typeof generateReportSchema>;