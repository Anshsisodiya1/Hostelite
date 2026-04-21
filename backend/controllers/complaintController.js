const admin = require("../firebaseAdmin");
const Complaint = require("../models/Complaint");
const User = require("../models/User");

// ==============================
// STUDENT: Submit Complaint
// ==============================
exports.submitComplaint = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        message: "Complaint description must be at least 10 characters long",
      });
    }

    const validPriorities = ["low", "medium", "high"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    const warden = await User.findOne({ role: "warden" });
    if (!warden) {
      return res.status(400).json({ message: "No warden available" });
    }

    const newComplaint = new Complaint({
      student: req.user._id,
      warden: warden._id,
      title: title.trim(),
      description: description.trim(),
      status: "pending",
      priority: priority || "medium",
      isNotified: false,
    });

    await newComplaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: newComplaint,
    });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ==============================
// GET Complaints (Role Based)
// ==============================
exports.getComplaints = async (req, res) => {
  try {
    const user = req.user;
    let complaints;

    if (user.role === "student") {
      complaints = await Complaint.find({ student: user._id })
        .populate("student", "name email roomNumber")
        .populate("warden", "name")
        .sort({ priority: -1, createdAt: -1 });
    } else if (user.role === "warden") {
      complaints = await Complaint.find({ warden: user._id }).populate(
        "student",
        "name email roomNumber",
      );

      // 🔥 CUSTOM PRIORITY SORT
      const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3,
      };

      complaints.sort((a, b) => {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } else if (user.role === "admin") {
      complaints = await Complaint.find()
        .populate("student", "name email roomNumber")
        .populate("warden", "name")
        .sort({ priority: -1, createdAt: -1 });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ==============================
// WARDEN / ADMIN: Update Status
// ==============================
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending", "in-progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (req.user.role !== "warden" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (req.user.role === "warden" && !complaint.warden.equals(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized for this complaint" });
    }

    complaint.status = status;

    // ==============================
    // 🔔 FIREBASE NOTIFICATION
    // ==============================
    if (status === "resolved") {
      complaint.isNotified = false;

      const student = await User.findById(complaint.student);

      if (student?.deviceToken) {
        try {
          await admin.messaging().send({
            notification: {
              title: "Hostelite",
              body: `Your complaint "${complaint.title}" has been resolved ✅`,
            },
            token: student.deviceToken,
          });

          console.log("🔔 Notification sent successfully");
        } catch (err) {
          console.error("❌ Notification error:", err.message);
        }
      } else {
        console.log("⚠️ No device token found for user");
      }
    }

    await complaint.save();

    res.status(200).json({
      message: "Complaint status updated",
      complaint,
    });
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ==============================
// STUDENT: Mark Notification Seen
// ==============================
exports.markAsNotified = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (!complaint.student.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    complaint.isNotified = true;
    await complaint.save();

    res.status(200).json({
      message: "Notification marked as seen",
    });
  } catch (error) {
    console.error("Error marking notification:", error);
    res.status(500).json({ message: error.message });
  }
};
