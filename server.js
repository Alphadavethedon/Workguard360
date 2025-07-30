const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ✅ Correct CORS for Vercel frontend
app.use(cors({
  origin: 'https://workguard360.vercel.app',
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));

// Root route for health check
app.get('/', (req, res) => {
  res.send('WorkGuard360 API is running');
});

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.error('MongoDB connection error:', err));
