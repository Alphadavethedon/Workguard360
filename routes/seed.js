const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/seed-demo-user", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: "admin@workguard360.com" });
    if (existingUser) {
      return res.status(200).json({ message: "Demo user already exists" });
    }

    const newUser = new User({
      email: "admin@workguard360.com",
      password: "demo123",
      role: "admin",
    });

    await newUser.save();
    res.status(201).json({ message: "Demo user created successfully" });
  } catch (error) {
    console.error("Seeding error:", error);
    res.status(500).json({ message: "Error creating demo user" });
  }
});

module.exports = router;
