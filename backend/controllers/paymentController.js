const Payment = require("../models/Payment");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// Razorpay instance (GLOBAL - better performance)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ================= CREATE ORDER =================
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // ✅ FIX: check user
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${req.user._id}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = new Payment({
      studentId: req.user._id,
      studentName: req.user.name,
      amount,
      status: "pending",
      razorpayOrderId: order.id,
    });

    await payment.save();

    res.status(200).json({
      success: true,
      order,
      paymentId: payment._id,
    });

  } catch (error) {
    console.error("🔥 CREATE ORDER ERROR FULL:", error); // VERY IMPORTANT
    res.status(500).json({
      message: "Server error",
      error: error.message, // show real error
    });
  }
};

// ================= VERIFY PAYMENT =================
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment data" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // Update payment in DB
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "completed";

    await payment.save();

    res.status(200).json({
      success: true,
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ADMIN =================
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Get All Payments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= STUDENT =================
exports.getStudentPayments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const payments = await Payment.find({ studentId }).sort({
      createdAt: -1,
    });

    res.json(payments);
  } catch (error) {
    console.error("Get Student Payments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= LEGACY =================
exports.payHostelFee = async (req, res) => {
  try {
    const { amount, month } = req.body;

    const newPayment = new Payment({
      studentId: req.user._id,
      studentName: req.user.name,
      amount,
      month,
      status: "completed",
    });

    await newPayment.save();

    res.status(201).json({
      message: "Payment successful",
      payment: newPayment,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      studentId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("Get Payments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};