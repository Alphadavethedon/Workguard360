const express = require('express');
const corsMiddleware = require('./middleware/cors');

const app = express();

app.use(corsMiddleware); // ✅ Enable CORS before routes
app.use(express.json());

// ... your routes
app.use('/api/auth', require('./routes/auth.route'));

// ✅ Handle unknown routes
app.get('/', (req, res) => {
  res.send('WorkGuard360 Backend is Live');
});
