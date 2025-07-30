require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existing = await User.findOne({ email: "admin@workguard360.com" });
    if (existing) {
      console.log("Demo user already exists");
      process.exit(0);
    }

    const user = new User({
      email: "admin@workguard360.com",
      password: "demo123",
      role: "admin"
    });

    await user.save();
    console.log("Demo user created");
    process.exit(0);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
