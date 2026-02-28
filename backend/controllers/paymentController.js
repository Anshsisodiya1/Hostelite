const Payment = require("../models/Payment");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { amount, studentId, studentName } = req.body;

    if (!amount || !studentId || !studentName) {
      return res.status(400).json({ message: "Amount, student ID and name are required" });
    }

    // Initialize Razorpay with environment variables
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `receipt_${studentId}_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = new Payment({
      studentId,
      studentName,
      amount,
      status: "pending",
      razorpayOrderId: order.id,
      date: new Date(),
    });

    await payment.save();

    res.status(200).json({ 
      success: true,
      order,
      paymentId: payment._id
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Payment verification details are required" });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Update payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = "completed";
    await payment.save();

    res.status(200).json({ 
      success: true, 
      message: "Payment verified successfully",
      payment
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all payments (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Get All Payments Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get student payments
exports.getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await Payment.find({ studentId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Get Student Payments Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Pay hostel fee (Legacy - kept for compatibility)
exports.payHostelFee = async (req, res) => {
  try {
    const { amount, month } = req.body;

    if (!amount || !month) {
      return res.status(400).json({ message: "Amount and month are required" });
    }

    const newPayment = new Payment({
      studentId: req.user._id,
      studentName: req.user.name,
      amount,
      month,
    });

    await newPayment.save();

    res.status(201).json({ message: "Payment successful", payment: newPayment });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all payments of logged-in user (Legacy)
exports.getPayments = async (req, res) => {
  try {
    // const payments = await Payment.find({ studentId: req.user._id });
    res.json(payments);
  } catch (error) {
    console.error("Get Payments Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};