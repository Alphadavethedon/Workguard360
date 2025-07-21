const cors = require("cors");

app.use(cors({
  origin: "https://workguard360.vercel.app", // frontend
  credentials: true
}));
