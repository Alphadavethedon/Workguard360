'use strict';
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/User');

(async function seed() {
  if (!process.env.MONGO_URI) return console.error('MONGO_URI missing');
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const exists = await User.findOne({ email: 'admin@workguard360.com' }).lean();
  if (exists) {
    console.log('Seed: admin user already exists');
    process.exit(0);
  }
  const u = new User({ email: 'admin@workguard360.com', password: 'demo123', firstName: 'Admin', lastName: 'WG', role: 'admin' });
  await u.save();
  console.log('Seed: created admin@workguard360.com / demo123');
  process.exit(0);
})();
