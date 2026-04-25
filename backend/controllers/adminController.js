const Complaint = require("../models/Complaint");
const Payment = require("../models/Payment");
const User = require("../models/User");


// Approve or reject a complaint
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { status } = req.body; // "approved" | "rejected"

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    res.json({ message: `Complaint ${status}`, complaint });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate("student", "name email roomNumber");
    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("student", "name email roomNumber");
    res.json({ payments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body; // "paid" | "pending" | "failed"

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    payment.status = status;
    await payment.save();

    res.json({ message: `Payment ${status}`, payment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password");
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update student info
exports.updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const updates = req.body;

    const student = await User.findByIdAndUpdate(studentId, updates, { new: true }).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    res.json({ message: "Student updated", student });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
