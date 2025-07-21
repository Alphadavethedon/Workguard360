

const express = require('express');
require('dotenv').config();
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
// Import your routes/middleware
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
// ... other route imports ...
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// Setup
const app = express();
app.set('trust proxy', 1); // ✅ trust proxy for rate limit
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'https://workguard360.vercel.app', methods: ['GET', 'POST'] }
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://workguard360.vercel.app',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use('/api/', rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  standardHeaders: true,
  legacyHeaders: false
}));

// Root routes
app.get('/', (req, res) => res.send('✅ WorkGuard360 Backend is Live'));
app.get('/health', (req, res) => res.json({ status: 'success', message: 'API running', environment: process.env.NODE_ENV }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// ... other routes ...
app.use(notFound);
app.use(errorHandler);

// Websockets
io.on('connection', socket => {
  console.log('Client connected:', socket.id);
  socket.on('join-dashboard', userId => socket.join(`user-${userId}`));
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// DB & Server start
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(conn => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 API running (env=${process.env.NODE_ENV})`);
    });
  })
  .catch(err => {
    console.error('DB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown & error handling omitted for brevity...
