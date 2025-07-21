const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');
const accessLogRoutes = require('./routes/accessLogs');
const shiftRoutes = require('./routes/shifts');
const floorRoutes = require('./routes/floors');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Setup
const app = express();
const server = createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://workguard360.vercel.app", // ✅ No trailing slash
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

// Helmet security
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ✅ FIXED: CORS config
app.use(cors({
  origin: process.env.CLIENT_URL || "https://workguard360.vercel.app", // ✅ No trailing slash
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'WorkGuard360 API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/access-logs', accessLogRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/floors', floorRoutes);

// WebSocket handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-dashboard', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined dashboard room`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`🚀 WorkGuard360 API running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
};

// Graceful shutdown handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

startServer();

module.exports = app;
