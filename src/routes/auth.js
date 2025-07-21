const express = require('express');
const router = express.Router();

const { login, getMe } = require('../controllers/auth.controller'); // ✅ This must point to the correct file
const auth = require('../middleware/auth'); // ✅ This must exist

router.post('/login', login);
router.get('/me', auth, getMe); // <-- line 127 causing the error

module.exports = router;
