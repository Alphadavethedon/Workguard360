const express = require('express');
const router = express.Router();

router.get('/check', (req, res) => {
  res.json({ message: 'Auth check successful' });
});

module.exports = router;
