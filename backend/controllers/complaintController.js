const admin = require("../firebaseAdmin");
const Complaint = require("../models/Complaint");
const User = require("../models/User");

// ==============================
// STUDENT: SUBMIT COMPLAINT
// ==============================
exports.submitComplaint = async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!description || description.trim().length < 10) {
      return res.status(400).json({
        message: "Description must be at least 10 characters",
      });
    }

    const student = await User.findById(req.user._id).populate({
      path: "room",
      populate: { path: "floor" },
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!student.room) {
      return res.status(400).json({ message: "Room not assigned" });
    }

    if (!student.room.floor) {
      return res.status(400).json({ message: "Floor not assigned" });
    }

    const warden = await User.findOne({
      role: "warden",
      floor: student.room.floor._id,
    });

    if (!warden) {
      return res.status(400).json({
        message: "No warden assigned for this floor",
      });
    }

    const complaint = await Complaint.create({
      student: student._id,
      warden: warden._id,
      title: title.trim(),
      description: description.trim(),
      priority: priority || "medium",
      room: student.room._id,
      floor: student.room.floor._id,
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// GET COMPLAINTS (FIXED POPULATION)
// ==============================
exports.getComplaints = async (req, res) => {
  try {
    const user = req.user;
    let complaints;

    // 🔥 LAST 7 DAYS FILTER
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const basePopulate = [
      { path: "student", select: "name email" },
      { path: "room", select: "roomNumber" },
      { path: "floor", select: "floorNumber" },
      { path: "warden", select: "name" },
    ];

    // ================= STUDENT =================
    if (user.role === "student") {
      complaints = await Complaint.find({
        student: user._id,
        createdAt: { $gte: sevenDaysAgo }, // 🔥 only last 7 days
      })
        .populate(basePopulate)
        .sort({ createdAt: -1 });
    }

    // ================= WARDEN =================
    else if (user.role === "warden") {
      complaints = await Complaint.find({
        warden: user._id,
        createdAt: { $gte: sevenDaysAgo }, // 🔥 only last 7 days
      })
        .populate(basePopulate)
        .sort({ createdAt: -1 });

      // priority sorting
      const priorityOrder = { high: 1, medium: 2, low: 3 };

      complaints.sort(
        (a, b) =>
          priorityOrder[a.priority] - priorityOrder[b.priority]
      );
    }

    // ================= ADMIN =================
    else if (user.role === "admin") {
      complaints = await Complaint.find({
        createdAt: { $gte: sevenDaysAgo }, // 🔥 optional but recommended
      })
        .populate(basePopulate)
        .sort({ createdAt: -1 });
    }

    else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(complaints);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// ==============================
// UPDATE STATUS
// ==============================
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending", "in-progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;

    if (status === "resolved") {
      const student = await User.findById(complaint.student);

      if (student?.deviceToken) {
        try {
          await admin.messaging().send({
            notification: {
              title: "Hostelite",
              body: `Complaint "${complaint.title}" resolved`,
            },
            token: student.deviceToken,
          });
        } catch (err) {
          console.log(err.message);
        }
      }

      complaint.isNotified = true;
    }

    await complaint.save();

    res.status(200).json({
      message: "Updated successfully",
      complaint,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// MARK NOTIFIED
// ==============================
exports.markAsNotified = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.isNotified = true;
    await complaint.save();

    res.json({ message: "Marked as notified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};