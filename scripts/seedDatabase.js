const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Incident = require('../models/Incident');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});

    const users = [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@workguard360.com',
        password: 'admin123',
        role: 'admin',
        department: 'Management',
        employeeId: 'EMP001',
        phone: '+1-555-0001',
        isActive: true
      },
      {
        firstName: 'Safety',
        lastName: 'Officer',
        email: 'safety@workguard360.com',
        password: 'safety123',
        role: 'safety_officer',
        department: 'Safety',
        employeeId: 'EMP002',
        phone: '+1-555-0002',
        isActive: true
      },
      {
        firstName: 'John',
        lastName: 'Manager',
        email: 'manager@workguard360.com',
        password: 'manager123',
        role: 'manager',
        department: 'Operations',
        employeeId: 'EMP003',
        phone: '+1-555-0003',
        isActive: true
      },
      {
        firstName: 'Jane',
        lastName: 'Employee',
        email: 'employee@workguard360.com',
        password: 'employee123',
        role: 'employee',
        department: 'IT',
        employeeId: 'EMP004',
        phone: '+1-555-0004',
        isActive: true
      }
    ];

    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

const seedIncidents = async (users) => {
  try {
    // Clear existing incidents
    await Incident.deleteMany({});

    const incidents = [
      {
        title: 'Slip and Fall in Cafeteria',
        description: 'Employee slipped on wet floor in cafeteria during lunch hour',
        category: 'workplace_injury',
        severity: 'medium',
        status: 'investigating',
        priority: 'high',
        reportedBy: users[3]._id, // Employee
        dateTimeOccurred: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        location: {
          building: 'Main Building',
          floor: '1st Floor',
          room: 'Cafeteria'
        },
        immediateActions: 'First aid provided, area cordoned off, wet floor signs placed'
      },
      {
        title: 'Equipment Malfunction - Printer Fire',
        description: 'Printer in IT department started smoking and small fire occurred',
        category: 'fire_safety',
        severity: 'high',
        status: 'resolved',
        priority: 'urgent',
        reportedBy: users[3]._id, // Employee
        assignedTo: users[1]._id, // Safety Officer
        dateTimeOccurred: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        location: {
          building: 'Main Building',
          floor: '2nd Floor',
          room: 'IT Department'
        },
        immediateActions: 'Fire extinguisher used, area evacuated, fire department notified',
        rootCause: 'Overheating due to blocked ventilation',
        preventiveMeasures: 'Regular equipment maintenance scheduled, ventilation improved'
      }
    ];

    const createdIncidents = await Incident.create(incidents);
    console.log(`✅ Created ${createdIncidents.length} incidents`);
  } catch (error) {
    console.error('Error seeding incidents:', error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    const users = await seedUsers();
    await seedIncidents(users);
    
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();