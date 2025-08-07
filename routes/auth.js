const express = require('express');
const router = express.Router();

const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // adjust path if needed


router.post('/login', login);


router.get('/me', protect, getMe);

module.exports = router;
