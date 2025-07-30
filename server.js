const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const logRoutes = require('./routes/logRoutes');
const violationRoutes = require('./routes/violationRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/violations', violationRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  // These options are now ignored by Mongoose 7+
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // exit on fatal DB error
});
