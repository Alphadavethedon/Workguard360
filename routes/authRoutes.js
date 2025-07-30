const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');

// Login Route
router.post('/login', AuthController.login);

// Optional: Signup/Register route (uncomment if needed)
// router.post('/register', AuthController.register);

module.exports = router;
