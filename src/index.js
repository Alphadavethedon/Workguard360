import cors from 'cors';

app.use(
  cors({
    origin: 'https://workguard360.vercel.app',
    credentials: true, // ✅ Must be true to allow cookies
  })
);
