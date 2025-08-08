// server.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const app = express();
const server = http.createServer(app);

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger); // Custom request logger
app.use(morgan('dev')); // HTTP logging

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));

// Error handler (last middleware)
app.use(errorHandler);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});
io.on('connection', socket => {
  console.log('🔌 New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  mongoose.connection.close(false, () => {
    console.log('💾 MongoDB connection closed.');
    server.close(() => {
      console.log('✅ Server stopped.');
      process.exit(0);
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
