const cors = require('cors');

const allowedOrigins = [
  'https://workguard360.vercel.app', // your frontend URL
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // IMPORTANT: allows cookies/auth headers
  })
);
