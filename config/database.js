const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle runtime connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
    });

    // Ensure indexes exist
    await createIndexes();

  } catch (error) {
    logger.error('❌ Database connection error:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

const createIndexes = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => {
        mongoose.connection.once('connected', resolve);
      });
    }

    const db =
