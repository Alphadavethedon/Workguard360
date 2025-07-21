
const express = require('express');
const { login, getCurrentUser, logout } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', login);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

module.exports = router;
