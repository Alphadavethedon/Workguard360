'use strict';

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const logger = require('./utils/logger');

dotenv.config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users'); // optional placeholder

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// connect to MongoDB with simple retry
(async function connect(retries = 5) {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    logger.error('MONGO_URI missing');
    process.exit(1);
  }
  while (retries) {
    try {
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
      logger.info('✅ MongoDB connected');
      break;
    } catch (err) {
      logger.error('Mongo connect error:', err.message);
      retries -= 1;
      if (!retries) process.exit(1);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
})();

// health root
app.get('/', (req, res) =>
  res.json({ status: 'ok', service: 'WorkGuard360 Backend', uptime: process.uptime() })
);

// API
app.use('/api/auth', authRoutes);
if (usersRoutes) app.use('/api/users', usersRoutes);

// 404 for unknown API
app.all('/api/*', (req, res) => res.status(404).json({ success: false, message: 'API route not found' }));

// simple error handler
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message || err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));
