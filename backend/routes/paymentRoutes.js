const express = require("express");
const { payHostelFee, getPayments, createOrder, verifyPayment, getAllPayments, getStudentPayments } = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/authMiddleware"); 

const router = express.Router();

// Razorpay payment routes
router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

// Admin routes
router.get("/all", authMiddleware, getAllPayments);

// Student specific routes
router.get("/student/:studentId", getStudentPayments);

// Legacy routes (kept for compatibility)
router.post("/pay", authMiddleware, payHostelFee);
router.get("/", authMiddleware, getPayments);

module.exports = router;