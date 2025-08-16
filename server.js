'use strict';

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users'); // keep if you have it

const app = express();

// Body parsing & limits
app.use(express.json({ limit: '10kb' }));

// Security
app.use(helmet());

// CORS (restrict to your frontend)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'https://workguard360.vercel.app',
    credentials: true,
  })
);

// Dev request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// DB connect with retry
(async function connectDB(retries = 5) {
  while (retries) {
    try {
      const uri = process.env.MONGO_URI;
      if (!uri) throw new Error('MONGO_URI missing');

      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      logger.info('✅ MongoDB Connected');
      break;
    } catch (err) {
      logger.error(`❌ MongoDB connection error: ${err.message}`);
      retries -= 1;
      if (!retries) process.exit(1);
      logger.info(`🔄 Retrying MongoDB connection (${retries} left)...`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
})();

// Health route (prevents "Cannot GET /")
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'WorkGuard360 Backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
if (userRoutes) app.use('/api/users', userRoutes);

// 404 for unknown API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Centralized error handler
app.use(errorHandler);

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
