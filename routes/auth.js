const express = require('express');
const { login } = require('../controllers/auth');
const router = express.Router();

router.post('/auth/login', login);

module.exports = router;
