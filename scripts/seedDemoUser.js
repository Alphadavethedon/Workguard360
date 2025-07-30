require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existing = await User.findOne({ email: "admin@workguard360.com" });
    if (existing) {
      console.log("Demo user already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("demo123", 12);

    const user = new User({
      name: "Admin Demo",
      email: "admin@workguard360.com",
      password: hashedPassword,
      role: "admin",
      department: "IT",
      position: "System Administrator",
      isActive: true
    });

    await user.save();
    console.log("✅ Demo user created");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
