require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // 👈 correct relative path
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const adminExists = await User.findOne({ email: 'admin@workguard360.com' });
    if (adminExists) {
      console.log('✅ Admin already exists.');
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash('demo123', 10);

    const admin = new User({
      name: 'Admin User',
      email: 'admin@workguard360.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
