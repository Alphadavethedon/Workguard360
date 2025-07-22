const express = require('express');
const { login, getCurrentUser, logout } = require('../controllers/authController'); // Adjusted path and name
const router = express.Router();

router.post('/login', login);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

module.exports = router;
