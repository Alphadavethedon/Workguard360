const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: 'admin@workguard360.com' });
    if (existing) {
      console.log('Admin user already exists');
    } else {
      const hashed = await bcrypt.hash('demo123', 10);
      await User.create({
        email: 'admin@workguard360.com',
        password: hashed,
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }

    process.exit();
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err);
    process.exit(1);
  }
};

seedAdmin();
