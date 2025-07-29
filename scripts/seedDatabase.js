require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: 'admin@workguard360.com' });

    if (existing) {
      console.log('❌ Admin already exists:', existing.email);
      return process.exit(0);
    }

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@workguard360.com',
      password: 'demo123', // will be hashed via pre('save')
      employeeId: 'ADM001',
      department: 'IT',
      role: 'admin',
      phone: '+254712345678'
    });

    console.log('✅ Admin user created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  }
};

seedAdmin();
