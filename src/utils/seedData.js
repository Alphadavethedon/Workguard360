const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Floor = require('../models/Floor');
const Shift = require('../models/Shift');
const AccessLog = require('../models/AccessLog');
const Alert = require('../models/Alert');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Floor.deleteMany({}),
      Shift.deleteMany({}),
      AccessLog.deleteMany({}),
      Alert.deleteMany({})
    ]);

    console.log('🗑️  Cleared existing data');

    // Create admin user first
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@workguard360.com',
      password: 'admin123',
      employeeId: 'ADM001',
      department: 'Administration',
      role: 'admin',
      isActive: true
    });

    console.log('👤 Created admin user');

    // Create shifts
    const shifts = await Shift.create([
      {
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '16:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        description: 'Standard morning shift',
        createdBy: adminUser._id
      },
      {
        name: 'Evening Shift',
        startTime: '16:00',
        endTime: '00:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        description: 'Evening shift',
        createdBy: adminUser._id
      },
      {
        name: 'Night Shift',
        startTime: '00:00',
        endTime: '08:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        description: 'Night security shift',
        createdBy: adminUser._id
      }
    ]);

    console.log('⏰ Created shifts');

    // Create floors
    const floors = await Floor.create([
      {
        name: 'Ground Floor',
        level: 0,
        description: 'Main entrance and reception',
        securityLevel: 'low',
        capacity: 100,
        departments: ['Reception', 'Security'],
        facilities: ['Main Entrance', 'Reception Desk', 'Security Office'],
        createdBy: adminUser._id
      },
      {
        name: 'First Floor',
        level: 1,
        description: 'General offices and meeting rooms',
        securityLevel: 'medium',
        capacity: 80,
        departments: ['HR', 'Finance', 'General Office'],
        facilities: ['Meeting Rooms', 'Open Office', 'Break Room'],
        createdBy: adminUser._id
      },
      {
        name: 'Second Floor',
        level: 2,
        description: 'Executive offices and boardroom',
        securityLevel: 'high',
        capacity: 50,
        departments: ['Executive', 'Legal'],
        facilities: ['Boardroom', 'Executive Offices', 'Private Meeting Rooms'],
        createdBy: adminUser._id
      },
      {
        name: 'Server Room',
        level: 1,
        description: 'IT infrastructure and servers',
        securityLevel: 'restricted',
        capacity: 10,
        departments: ['IT'],
        facilities: ['Servers', 'Network Equipment', 'Backup Systems'],
        requiresEscort: true,
        createdBy: adminUser._id
      }
    ]);

    console.log('🏢 Created floors');

    // Create sample users
    const users = await User.create([
      {
        name: 'HR Manager',
        email: 'hr@workguard360.com',
        password: 'hr123',
        employeeId: 'HR001',
        department: 'Human Resources',
        role: 'hr',
        shift: shifts[0]._id,
        authorizedFloors: [floors[0]._id, floors[1]._id],
        isActive: true
      },
      {
        name: 'Security Officer',
        email: 'security@workguard360.com',
        password: 'security123',
        employeeId: 'SEC001',
        department: 'Security',
        role: 'security',
        shift: shifts[2]._id,
        authorizedFloors: floors.map(f => f._id),
        isActive: true
      },
      {
        name: 'John Doe',
        email: 'john.doe@workguard360.com',
        password: 'employee123',
        employeeId: 'EMP001',
        department: 'Finance',
        role: 'employee',
        shift: shifts[0]._id,
        authorizedFloors: [floors[0]._id, floors[1]._id],
        isActive: true
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@workguard360.com',
        password: 'employee123',
        employeeId: 'EMP002',
        department: 'IT',
        role: 'employee',
        shift: shifts[0]._id,
        authorizedFloors: [floors[0]._id, floors[1]._id, floors[3]._id],
        isActive: true
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@workguard360.com',
        password: 'employee123',
        employeeId: 'EMP003',
        department: 'Executive',
        role: 'employee',
        shift: shifts[0]._id,
        authorizedFloors: floors.map(f => f._id),
        isActive: true
      }
    ]);

    console.log('👥 Created sample users');

    // Create sample access logs
    const accessLogs = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomFloor = floors[Math.floor(Math.random() * floors.length)];
      const randomHours = Math.floor(Math.random() * 24 * 7); // Last 7 days
      const timestamp = new Date(now.getTime() - randomHours * 60 * 60 * 1000);
      
      // Check if access should be authorized
      const isFloorAuthorized = randomUser.authorizedFloors.includes(randomFloor._id);
      const isAuthorized = isFloorAuthorized && Math.random() > 0.1; // 10% violation rate
      
      accessLogs.push({
        user: randomUser._id,
        employeeId: randomUser.employeeId,
        floor: randomFloor._id,
        accessType: Math.random() > 0.5 ? 'entry' : 'exit',
        timestamp,
        accessMethod: ['card', 'biometric', 'pin'][Math.floor(Math.random() * 3)],
        isAuthorized,
        violationType: !isAuthorized ? 
          (isFloorAuthorized ? 'shift_violation' : 'floor_breach') : undefined
      });
    }

    await AccessLog.create(accessLogs);
    console.log('📊 Created sample access logs');

    // Create sample alerts
    const alerts = await Alert.create([
      {
        title: 'Unauthorized Access Attempt',
        message: 'Employee EMP001 attempted to access Server Room without authorization',
        type: 'violation',
        severity: 'high',
        relatedUser: users[2]._id,
        relatedFloor: floors[3]._id,
        createdBy: adminUser._id
      },
      {
        title: 'System Maintenance Required',
        message: 'Access control system on Floor 2 requires maintenance',
        type: 'maintenance',
        severity: 'medium',
        relatedFloor: floors[2]._id,
        createdBy: adminUser._id
      },
      {
        title: 'Multiple Failed Access Attempts',
        message: 'Multiple failed biometric scans detected at Ground Floor entrance',
        type: 'security',
        severity: 'high',
        relatedFloor: floors[0]._id,
        createdBy: adminUser._id
      }
    ]);

    console.log('🚨 Created sample alerts');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('Admin: admin@workguard360.com / admin123');
    console.log('HR: hr@workguard360.com / hr123');
    console.log('Security: security@workguard360.com / security123');
    console.log('Employee: john.doe@workguard360.com / employee123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;