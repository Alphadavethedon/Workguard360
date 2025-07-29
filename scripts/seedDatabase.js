require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust if needed

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const hashedPassword = await bcrypt.hash('demo123', 10);

    await User.findOneAndUpdate(
      { email: 'admin@workguard360.com' },
      {
        name: 'Admin User',
        email: 'admin@workguard360.com',
        password: hashedPassword,
        role: 'admin',
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin user created or updated!');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
