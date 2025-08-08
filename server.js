require('dotenv').config();
require('express-async-errors');
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const { logger } = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');
const dashboardRoutes = require('./routes/dashboard');
const healthRoutes = require('./routes/health');

// App setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);

// Not Found & Error Handling
app.use(notFound);
app.use(errorHandler);

// Database & Server Start
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  logger.info('✅ Connected to MongoDB');
  server.listen(PORT, () => {
    logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
    logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
    logger.info(`🔗 Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  });
})
.catch((err) => {
  logger.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Socket.IO Realtime
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('joinRoom', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Graceful Shutdown
const shutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('Server closed.');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => shutdown(signal));
});
