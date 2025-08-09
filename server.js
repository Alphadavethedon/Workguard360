// server.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Load env vars
dotenv.config();

// Utils & Middleware
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

// Initialize app
const app = express();

// Body parser
app.use(express.json());

// Security middleware
app.use(helmet());

// CORS setup — allow your frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://workguard360.vercel.app',
  credentials: true
}));

// HTTP request logger (only in dev)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.info('✅ MongoDB Connected'))
.catch(err => {
  logger.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

// Handle 404s for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// If you want to serve frontend build (optional for local prod testing)
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'client/build')));
//   app.get('*', (req, res) =>
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
//   );
// }

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
