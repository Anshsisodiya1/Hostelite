const express = require("express");
const {
  createOrder,
  verifyPayment,
  getAllPayments,
  getStudentPayments,
  payHostelFee,
  getPayments,
} = require("../controllers/paymentController");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Razorpay routes
router.post("/create-order", authMiddleware, createOrder);
router.post("/verify-payment", authMiddleware, verifyPayment);

// Admin
router.get("/all", authMiddleware, getAllPayments);

// Student
router.get("/student/:studentId", authMiddleware, getStudentPayments);

// Legacy
router.post("/pay", authMiddleware, payHostelFee);
router.get("/", authMiddleware, getPayments);

module.exports = router;