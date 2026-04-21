const express = require("express");
const {
  submitComplaint,
  getComplaints,
  updateComplaintStatus,
  markAsNotified, // ✅ NEW
} = require("../controllers/complaintController");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// ==============================
// STUDENT: Submit Complaint
// ==============================
router.post("/", authMiddleware, submitComplaint);

// ==============================
// GET Complaints (All Roles)
// ==============================
router.get("/", authMiddleware, getComplaints);

// ==============================
// WARDEN / ADMIN: Update Status
// ==============================
router.put("/:id", authMiddleware, updateComplaintStatus);

// ==============================
// STUDENT: Mark Notification Seen
// ==============================
router.put("/:id/notify", authMiddleware, markAsNotified); // ✅ NEW

module.exports = router;