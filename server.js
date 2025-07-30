require("./scripts/seedDemoAdmin");

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const incidentRoutes = require('./routes/incidents');
const safetyRoutes = require('./routes/safety');
const emergencyRoutes = require('./routes/emergency');
const trainingRoutes = require('./routes/training');
const documentRoutes = require('./routes/documents');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

// Load environment variables
require('dotenv').config();

// Create necessary directories
const createDirectories = () => {
  const dirs = ['logs', 'uploads', 'uploads/documents'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirectories();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      'https://workguard360.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5000'
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

// Make io accessible to req object
app.set('io', io);

// Connect to MongoDB
connectDB();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration - Critical for frontend connection
const cors = require('cors');

// Allow frontend URL (add more origins if needed)
const allowedOrigins = ['https://workguard360.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Allow in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['X-Total-Count']
}));

// Handle preflight requests
app.options('*', cors());

// Rate limiting with different tiers
const createRateLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { success: false, message },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

// General API rate limiting
app.use('/api/', createRateLimit(15 * 60 * 1000, 1000, 'Too many requests from this IP'));

// Stricter rate limiting for auth routes
app.use('/api/auth', createRateLimit(15 * 60 * 1000, 50, 'Too many authentication attempts'));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'status', 'priority']
}));

// Compression middleware
app.use(compression());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Workguard360 API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Workguard360 API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      users: '/api/users',
      incidents: '/api/incidents',
      safety: '/api/safety',
      emergency: '/api/emergency',
      training: '/api/training',
      documents: '/api/documents',
      analytics: '/api/analytics',
      notifications: '/api/notifications'
    }
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user-specific room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${socket.id} joined room user-${userId}`);
  });

  // Join role-based room
  socket.on('join-role-room', (role) => {
    socket.join(`role-${role}`);
    logger.info(`User ${socket.id} joined room role-${role}`);
  });

  // Join department-based room
  socket.on('join-department-room', (department) => {
    socket.join(`department-${department}`);
    logger.info(`User ${socket.id} joined room department-${department}`);
  });

  // Handle real-time incident updates
  socket.on('incident-update', (data) => {
    socket.broadcast.emit('incident-updated', data);
  });

  // Handle emergency alerts
  socket.on('emergency-alert', (data) => {
    io.emit('emergency-broadcast', data);
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 Workguard360 server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  logger.info(`📱 Frontend URL: ${process.env.CLIENT_URL}`);
  logger.info(`🔗 API Base URL: https://workguard360.onrender.com/api`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
