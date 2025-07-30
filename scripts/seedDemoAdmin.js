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
      role: "admin",
      employeeId: "WGA-0001" // ✅ Added to satisfy the unique index
    });

    awa
