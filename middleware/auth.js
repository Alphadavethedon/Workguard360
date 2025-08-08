const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// Login route
router.post('/login', login);

// Get current logged-in user
router.get('/me', auth, getMe);

module.exports = router;
