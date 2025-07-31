const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors({
  origin: 'https://workguard360.vercel.app',
  credentials: true,
}));
app.use(express.json());
app.use('/api', authRoutes);

module.exports = app; // Export the app for Vercel
