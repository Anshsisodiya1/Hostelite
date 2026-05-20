const express = require("express");

const {
  registerUser,
  loginUser,
  resetPassword,
  forgotPassword,
  generate2FA,
  verify2FASetup,
  verify2FALogin,
} = require("../controllers/authController");

// ✅ FIXED IMPORT
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/generate-2fa", authMiddleware, generate2FA);
router.post("/verify-2fa-setup", authMiddleware, verify2FASetup);
router.post("/verify-2fa-login", verify2FALogin);

module.exports = router;