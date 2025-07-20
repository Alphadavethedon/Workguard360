import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) throw new Error('MongoDB URI not found');
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany();

    // Seed admin user
    await User.create({
      name: 'Admin',
      email: 'admin@workguard360.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDB();