import mongoose from 'mongoose';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Permission } from '../models/Permission';
import { Alert } from '../models/Alert';
import { env } from '../config/env';
import { logger } from '../config/logger';

const seedDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Role.deleteMany({}),
      Permission.deleteMany({}),
      Alert.deleteMany({}),
    ]);

    // Create permissions
    const permissions = await Permission.insertMany([
      { name: 'users.read', resource: 'users', action: 'read', description: 'Read users' },
      { name: 'users.create', resource: 'users', action: 'create', description: 'Create users' },
      { name: 'users.update', resource: 'users', action: 'update', description: 'Update users' },
      { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
      { name: 'alerts.read', resource: 'alerts', action: 'read', description: 'Read alerts' },
      { name: 'alerts.update', resource: 'alerts', action: 'update', description: 'Update alerts' },
      { name: 'reports.read', resource: 'reports', action: 'read', description: 'Read reports' },
      { name: 'reports.create', resource: 'reports', action: 'create', description: 'Create reports' },
      { name: 'shifts.read', resource: 'shifts', action: 'read', description: 'Read shifts' },
      { name: 'shifts.manage', resource: 'shifts', action: 'manage', description: 'Manage shifts' },
      { name: 'floors.read', resource: 'floors', action: 'read', description: 'Read floors' },
      { name: 'floors.manage', resource: 'floors', action: 'manage', description: 'Manage floors' },
    ]);

    // Create roles
    const adminRole = await Role.create({
      name: 'admin',
      description: 'Administrator with full access',
      permissions: permissions.map(p => p._id),
      accessLevel: 10,
    });

    const hrRole = await Role.create({
      name: 'hr',
      description: 'Human Resources Manager',
      permissions: permissions.filter(p => 
        ['users.read', 'alerts.read', 'reports.read', 'reports.create', 'shifts.read', 'shifts.manage'].includes(p.name)
      ).map(p => p._id),
      accessLevel: 7,
    });

    const securityRole = await Role.create({
      name: 'security',
      description: 'Security Manager',
      permissions: permissions.filter(p => 
        ['alerts.read', 'alerts.update', 'reports.read', 'users.read'].includes(p.name)
      ).map(p => p._id),
      accessLevel: 6,
    });

    const employeeRole = await Role.create({
      name: 'employee',
      description: 'Regular Employee',
      permissions: permissions.filter(p => 
        ['alerts.read', 'reports.read'].includes(p.name)
      ).map(p => p._id),
      accessLevel: 3,
    });

    // Create users
    const users = await User.insertMany([
      {
        email: 'admin@workguard360.com',
        password: 'demo123',
        firstName: 'Admin',
        lastName: 'User',
        role: adminRole._id,
        department: 'Operations',
        jobTitle: 'System Administrator',
        badgeNumber: 'WG-2024-001',
        accessLevel: 10,
        phone: '+1-555-0001',
        emergencyContact: 'Emergency Contact - +1-555-0002',
      },
      {
        email: 'hr@workguard360.com',
        password: 'hr123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: hrRole._id,
        department: 'Human Resources',
        jobTitle: 'HR Manager',
        badgeNumber: 'WG-2024-002',
        accessLevel: 7,
        phone: '+1-555-0003',
        emergencyContact: 'Emergency Contact - +1-555-0004',
      },
      {
        email: 'security@workguard360.com',
        password: 'security123',
        firstName: 'Mike',
        lastName: 'Johnson',
        role: securityRole._id,
        department: 'Security',
        jobTitle: 'Security Manager',
        badgeNumber: 'WG-2024-003',
        accessLevel: 6,
        phone: '+1-555-0005',
        emergencyContact: 'Emergency Contact - +1-555-0006',
      },
      {
        email: 'emily.davis@workguard360.com',
        password: 'demo123',
        firstName: 'Emily',
        lastName: 'Davis',
        role: hrRole._id,
        department: 'Human Resources',
        jobTitle: 'HR Specialist',
        badgeNumber: 'WG-2024-004',
        accessLevel: 5,
        phone: '+1-555-0007',
        emergencyContact: 'Emergency Contact - +1-555-0008',
      },
      {
        email: 'john.doe@workguard360.com',
        password: 'demo123',
        firstName: 'John',
        lastName: 'Doe',
        role: employeeRole._id,
        department: 'Engineering',
        jobTitle: 'Software Engineer',
        badgeNumber: 'WG-2024-005',
        accessLevel: 3,
        phone: '+1-555-0009',
        emergencyContact: 'Emergency Contact - +1-555-0010',
      },
    ]);

    // Create sample alerts
    await Alert.insertMany([
      {
        type: 'security',
        severity: 'high',
        title: 'Unauthorized Access Attempt',
        description: 'Multiple failed login attempts detected from IP 192.168.1.100',
        status: 'active',
        location: 'Server Room - Floor 3',
        triggeredBy: 'Security System',
        assignedTo: users.find(u => u.email === 'security@workguard360.com')?._id,
      },
      {
        type: 'compliance',
        severity: 'medium',
        title: 'Badge Not Scanned',
        description: 'Employee entered restricted area without badge scan',
        status: 'acknowledged',
        location: 'Executive Floor - Floor 5',
        triggeredBy: 'Access Control System',
        assignedTo: users.find(u => u.email === 'security@workguard360.com')?._id,
        acknowledgedBy: users.find(u => u.email === 'security@workguard360.com')?._id,
        acknowledgedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        type: 'system',
        severity: 'low',
        title: 'Camera Offline',
        description: 'Security camera in parking lot is not responding',
        status: 'resolved',
        location: 'Parking Lot - Camera 7',
        triggeredBy: 'Monitoring System',
        assignedTo: users.find(u => u.email === 'security@workguard360.com')?._id,
        resolvedBy: users.find(u => u.email === 'security@workguard360.com')?._id,
        resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        type: 'emergency',
        severity: 'critical',
        title: 'Fire Alarm Triggered',
        description: 'Fire alarm activated in building sector C',
        status: 'active',
        location: 'Building C - Floor 2',
        triggeredBy: 'Fire Safety System',
        assignedTo: users.find(u => u.email === 'security@workguard360.com')?._id,
      },
      {
        type: 'security',
        severity: 'medium',
        title: 'Tailgating Detected',
        description: 'Person followed authorized employee through secure door',
        status: 'acknowledged',
        location: 'Main Entrance',
        triggeredBy: 'Access Control System',
        assignedTo: users.find(u => u.email === 'security@workguard360.com')?._id,
        acknowledgedBy: users.find(u => u.email === 'security@workguard360.com')?._id,
        acknowledgedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      },
    ]);

    logger.info('Database seeded successfully');
    logger.info('Admin user created: admin@workguard360.com / demo123');
    logger.info('HR user created: hr@workguard360.com / hr123');
    logger.info('Security user created: security@workguard360.com / security123');

    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();