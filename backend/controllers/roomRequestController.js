const RoomAssignmentRequest = require("../models/RoomAssignmentRequest");
const User = require("../models/User");
const Room = require("../models/Room");
const Floor = require("../models/Floor");
const UserProfile = require("../models/UserProfile"); 
// ─────────────────────────────────────────────
// ADMIN — Create a room assignment request
// POST /api/room-requests
// ─────────────────────────────────────────────
const createRoomRequest = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;
    const adminId = req.user._id;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const room = await Room.findById(roomId).populate("floor");
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const floorId = room.floor?._id || room.floor;
    if (!floorId) {
      return res.status(400).json({ message: "Room has no floor assigned" });
    }

    const warden = await User.findOne({ role: "warden", floor: floorId });
    if (!warden) {
      return res.status(404).json({
        message: "No warden assigned to this floor. Assign a warden first.",
      });
    }

    const existing = await RoomAssignmentRequest.findOne({
      student: studentId,
      status: "pending",
    });
    if (existing) {
      return res.status(400).json({
        message: "A pending room request already exists for this student",
      });
    }

    const request = await RoomAssignmentRequest.create({
      student: studentId,
      room: roomId,
      floor: floorId,
      requestedBy: adminId,
      assignedWarden: warden._id,
      status: "pending",
    });

    const populated = await request.populate([
      { path: "student", select: "name email" },
      { path: "room", select: "roomNumber" },
      { path: "floor", select: "floorNumber" },
      { path: "assignedWarden", select: "name email" },
    ]);

    res.status(201).json({
      message: "Room assignment request sent to warden for approval",
      request: populated,
    });
  } catch (err) {
    console.error("createRoomRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// WARDEN — Get all requests for their floor
// GET /api/room-requests/warden
// ─────────────────────────────────────────────
const getWardenRequests = async (req, res) => {
  try {
    const wardenId = req.user._id;
    const { status } = req.query;

    const filter = { assignedWarden: wardenId };
    if (status) filter.status = status;

    const requests = await RoomAssignmentRequest.find(filter)
      .populate("student", "name email")
      .populate("room", "roomNumber")
      .populate("floor", "floorNumber")
      .populate("requestedBy", "name email")
      .sort({ createdAt: -1 });

    // ── Fetch phone from UserProfile for each student ──
    const studentIds = requests.map((r) => r.student?._id).filter(Boolean);
    const profiles   = await UserProfile.find(
      { user: { $in: studentIds } },
      "user phone"
    );

    // Build map: userId → phone
    const phoneMap = {};
    profiles.forEach((p) => {
      phoneMap[p.user.toString()] = p.phone || null;
    });

    // Attach phone to each request's student
    const enriched = requests.map((r) => {
      const obj = r.toObject();
      if (obj.student?._id) {
        obj.student.phone = phoneMap[obj.student._id.toString()] || null;
      }
      return obj;
    });

    res.status(200).json(enriched);
  } catch (err) {
    console.error("getWardenRequests error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// ─────────────────────────────────────────────
// WARDEN — Get only pending count (for badge)
// GET /api/room-requests/warden/pending-count
// ─────────────────────────────────────────────
const getWardenPendingCount = async (req, res) => {
  try {
    const count = await RoomAssignmentRequest.countDocuments({
      assignedWarden: req.user._id,
      status: "pending",
    });
    res.status(200).json({ count });
  } catch (err) {
    console.error("getWardenPendingCount error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// WARDEN — Approve a request
// PATCH /api/room-requests/:id/approve
// ─────────────────────────────────────────────
const approveRoomRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const wardenId = req.user._id;

    const request = await RoomAssignmentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.assignedWarden.toString() !== wardenId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    const room = await Room.findById(request.room);
    if (!room) {
      return res.status(404).json({ message: "Room no longer exists" });
    }

    // ── Actually assign the room to the student ──
    await User.findByIdAndUpdate(request.student, {
      room: request.room,
      floor: request.floor,
    });

    request.status = "approved";
    request.wardenNote = req.body.wardenNote || "";
    await request.save();

    const populated = await request.populate([
      { path: "student", select: "name email" },
      { path: "room", select: "roomNumber" },
      { path: "floor", select: "floorNumber" },
    ]);

    res.status(200).json({
      message: "Room assignment approved. Student has been assigned the room.",
      request: populated,
    });
  } catch (err) {
    console.error("approveRoomRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// WARDEN — Reject a request
// PATCH /api/room-requests/:id/reject
// ─────────────────────────────────────────────
const rejectRoomRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const wardenId = req.user._id;
    const { wardenNote } = req.body;

    const request = await RoomAssignmentRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.assignedWarden.toString() !== wardenId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = "rejected";
    request.wardenNote = wardenNote || "";
    await request.save();

    const populated = await request.populate([
      { path: "student", select: "name email" },
      { path: "room", select: "roomNumber" },
      { path: "floor", select: "floorNumber" },
    ]);

    res.status(200).json({
      message: "Room assignment rejected.",
      request: populated,
    });
  } catch (err) {
    console.error("rejectRoomRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN — Get all requests (all floors)
// GET /api/room-requests/admin/all
// ─────────────────────────────────────────────
const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const requests = await RoomAssignmentRequest.find(filter)
      .populate("student", "name email")
      .populate("room", "roomNumber")
      .populate("floor", "floorNumber")
      .populate("requestedBy", "name")
      .populate("assignedWarden", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error("getAllRequests error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
// ADMIN — Cancel a pending request
// DELETE /api/room-requests/:id
// ─────────────────────────────────────────────
const cancelRoomRequest = async (req, res) => {
  try {
    const request = await RoomAssignmentRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be cancelled" });
    }
    await request.deleteOne();
    res.status(200).json({ message: "Request cancelled successfully" });
  } catch (err) {
    console.error("cancelRoomRequest error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─────────────────────────────────────────────
module.exports = {
  createRoomRequest,
  getWardenRequests,
  getWardenPendingCount,
  approveRoomRequest,
  rejectRoomRequest,
  getAllRequests,
  cancelRoomRequest,
};