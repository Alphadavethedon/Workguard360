require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: "admin@workguard360.com" });
    if (existing) {
      console.log("ℹ️ Admin user already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("demo123", 10);
    const user = new User({
      email: "admin@workguard360.com",
      password: hashedPassword,
      role: "admin"
    });

    await user.save();
    console.log("✅ Demo admin user created.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to seed admin:", err);
    process.exit(1);
  }
}

seedAdmin();
