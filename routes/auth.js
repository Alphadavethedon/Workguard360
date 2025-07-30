const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController"); //

router.post("/login", authController.login); // ✅ this must reference a defined function

module.exports = router;
