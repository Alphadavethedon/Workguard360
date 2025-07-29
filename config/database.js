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

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
    });

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

    const db = mongoose.connection.db;

    const userIndexes = await db.collection('users').indexInformation({ full: true });
    const incidentIndexes = await db.collection('incidents').indexInformation({ full: true });

    if (!userIndexes.find(i => i.name === 'email_1')) {
      await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true });
    }

    if (!userIndexes.find(i => i.name === 'employeeId_1')) {
      await db.collection('users').createIndex({ employeeId: 1 }, { unique: true, background: true });
    }

    await db.collection('users').createIndex({ role: 1, department: 1 });
    await db.collection('incidents').createIndex({ reportedBy: 1, createdAt: -1 });
    await db.collection('incidents').createIndex({ category: 1, severity: 1 });
    await db.collection('incidents').createIndex({ status: 1, priority: 1 });
    await db.collection('incidents').createIndex({ dateTimeOccurred: -1 });

    logger.info('✅ Database indexes created successfully');
  } catch (error) {
    logger.warn('⚠️ Warning creating indexes (might already exist):', error.message);
  }
};

module.exports = connectDB;
