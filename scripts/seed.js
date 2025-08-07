const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Alert = require('../models/Alert');

const logger = require('../utils/logger');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Seed data
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Alert.deleteMany({});
    
    console.log('Cleared existing data...');

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('demo123', salt);

    // Create users
    const users = await User.create([
      {
        name: 'System Administrator',
        email: 'admin@workguard360.com',
        password: hashedPassword,
        employeeId: 'ADM001',
        department: 'IT',
        role: 'admin',
        isActive: true,
        phone: '070000000',
        accessLevel: 5
      },
      {
        name: 'Security Manager',
        email: 'manager@workguard360.com',
        password: hashedPassword,
        employeeId: 'SEC001',
        department: 'Security',
        role: 'security_manager',
        isActive: true,
        phone: '0720000',
        accessLevel: 4
      },
      {
        name: 'Security Guard Alpha',
        email: 'guard1@workguard360.com',
        password: hashedPassword,
        employeeId: 'GRD001',
        department: 'Security',
        role: 'security_guard',
        isActive: true,
        phone: '073000',
        accessLevel: 3,
        badgeNumber: 'SEC-001'
      },
      {
        name: 'Security Guard Beta',
        email: 'guard2@workguard360.com',
        password: hashedPassword,
        employeeId: 'GRD002',
        department: 'Security',
        role: 'security_guard',
        isActive: true,
        phone: '070004',
        accessLevel: 3,
        badgeNumber: 'SEC-002'
      },
      {
        name: 'John Employee',
        email: 'employee@workguard360.com',
        password: hashedPassword,
        employeeId: 'EMP001',
        department: 'Operations',
        role: 'employee',
        isActive: true,
        phone: '07000005',
        accessLevel: 1
      }
    ]);

    console.log(`Created ${users.length} users...`);

    // Create alerts
    const alertTypes = [
      'security_breach',
      'unauthorized_access',
      'system_failure',
      'maintenance_required',
      'policy_violation',
      'suspicious_activity',
      'equipment_malfunction',
      'access_denied'
    ];

    const severities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['open', 'in_progress', 'resolved'];
    const buildings = ['Main Building', 'North Wing', 'South Wing', 'Data Center'];
    const floors = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 'Basement'];

    const alerts = [];
    for (let i = 0; i < 25; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomAssigned = users.slice(0, 3)[Math.floor(Math.random() * 3)]; // Admin, Manager, or Guard
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomBuilding = buildings[Math.floor(Math.random() * buildings.length)];
      const randomFloor = floors[Math.floor(Math.random() * floors.length)];

      const alert = {
        title: `Alert ${i + 1}: ${randomType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        description: `Detailed description for alert ${i + 1}. This is a ${randomSeverity} severity ${randomType} incident that requires immediate attention.`,
        type: randomType,
        severity: randomSeverity,
        status: randomStatus,
        location: {
          building: randomBuilding,
          floor: randomFloor,
          room: `Room ${Math.floor(Math.random() * 50) + 100}`
        },
        reportedBy: randomUser._id,
        assignedTo: randomAssigned._id,
        department: randomUser.department,
        priority: Math.floor(Math.random() * 5) + 1,
        tags: [`${randomType}`, `${randomSeverity}`, randomBuilding.toLowerCase().replace(' ', '-')],
        isUrgent: randomSeverity === 'critical' || randomSeverity === 'high',
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
      };

      if (randomStatus === 'resolved') {
        alert.resolvedAt = new Date(alert.createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        alert.resolvedBy = randomAssigned._id;
        alert.resolution = `This ${randomType} has been successfully resolved. All necessary measures have been taken.`;
      }

      alerts.push(alert);
    }

    const createdAlerts = await Alert.create(alerts);
    console.log(`Created ${createdAlerts.length} alerts...`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Demo Login Credentials:');
    console.log('Admin: admin@workguard360.com / demo123');
    console.log('Manager: manager@workguard360.com / demo123');
    console.log('Guard: guard1@workguard360.com / demo123');
    console.log('Employee: employee@workguard360.com / demo123');
    
    console.log('\n📊 Seeded Data:');
    console.log(`- ${users.length} Users`);
    console.log(`- ${createdAlerts.length} Alerts`);
    console.log('- Complete role-based permissions');
    console.log('- 7 days of sample data');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

runSeed();