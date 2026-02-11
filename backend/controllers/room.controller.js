const Room = require("../models/Room");
const User = require("../models/User");

// ===== CREATE ROOMS =====
const createRooms = async (req, res) => {
  try {
    const { totalRooms } = req.body;

    if (!totalRooms || totalRooms <= 0) {
      return res.status(400).json({ message: "Invalid number of rooms" });
    }

    // 🔥 Check if rooms already exist
    const existingRooms = await Room.countDocuments();

    if (existingRooms > 0) {
      return res.status(400).json({
        message: "Rooms already created. Delete existing rooms first.",
      });
    }

    let rooms = [];

    for (let i = 1; i <= totalRooms; i++) {
      rooms.push({
        roomNumber: `R-${i}`,
        isOccupied: false,
      });
    }

    await Room.insertMany(rooms);

    res.json({ message: `${totalRooms} Rooms created successfully` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating rooms" });
  }
};

// ===== GET ALL ROOMS =====
const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("assignedTo", "name email");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
};

// ===== GET AVAILABLE ROOMS =====
const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isOccupied: false });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available rooms" });
  }
};

// ===== ASSIGN ROOM =====
const assignRoom = async (req, res) => {
  try {
    const { studentId, roomId } = req.body;

    const room = await Room.findById(roomId);
    const student = await User.findById(studentId);

    if (!room || !student) {
      return res.status(404).json({ message: "Room or Student not found" });
    }

    if (room.isOccupied) {
      return res.status(400).json({ message: "Room already occupied" });
    }

    if (student.room) {
      return res.status(400).json({ message: "Student already has a room" });
    }

    room.isOccupied = true;
    room.assignedTo = studentId;
    await room.save();

    student.room = roomId;
    await student.save();

    res.json({ message: "Room assigned successfully" });

  } catch (error) {
    res.status(500).json({ message: "Assignment failed" });
  }
};

// ===== UNASSIGN ROOM =====
const unassignRoom = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await User.findById(studentId);

    if (!student || !student.room) {
      return res.status(400).json({ message: "Student has no room" });
    }

    const room = await Room.findById(student.room);

    room.isOccupied = false;
    room.assignedTo = null;
    await room.save();

    student.room = null;
    await student.save();

    res.json({ message: "Room unassigned successfully" });

  } catch (error) {
    res.status(500).json({ message: "Unassignment failed" });
  }
};

// 🔥 IMPORTANT EXPORT
module.exports = {
  createRooms,
  getAllRooms,
  getAvailableRooms,
  assignRoom,
  unassignRoom,
};
