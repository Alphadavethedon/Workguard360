require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'https://workguard360.vercel.app',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', authRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app; // Export for Vercel
