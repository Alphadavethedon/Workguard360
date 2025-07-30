const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const existingUser = await User.findOne({ email: "admin@workguard360.com" });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("demo123", 10);
    await User.create({
      email: "admin@workguard360.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️ Admin user already exists");
  }
  mongoose.disconnect();
});
