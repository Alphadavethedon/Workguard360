const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const authRoutes = require('./routes/authRoutes'); // adjust if different
const userRoutes = require('./routes/userRoutes');
const alertRoutes = require('./routes/alertRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

dotenv.config();
const app = express();

// Middleware
app.use(helmet()); // for security headers
app.use(compression()); // GZIP responses
app.use(express.json({ limit: '10mb' })); // allow large JSON bodies
app.use(cookieParser());

// CORS
const allowedOrigins = [
  'https://workguard360.vercel.app',
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);

// Root Route
app.get('/', (req, res) => {
  res.status(200).send('🚀 WorkGuard360 API is running!');
});

// Error handler (last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  await connectDB();
  logger.info(`✅ Server started on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  logger.info('🔁 SIGINT received. Shutting down...');
  server.close(() => {
    logger.info('🧹 Server closed.');
    process.exit(0);
  });
});
