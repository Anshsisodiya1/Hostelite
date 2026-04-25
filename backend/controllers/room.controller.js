const Room = require("../models/Room");
const User = require("../models/User");

// ===== CREATE ROOMS =====
const createRooms = async (req, res) => {
  try {
    const { totalRooms } = req.body;

    if (!totalRooms || totalRooms <= 0) {
      return res.status(400).json({ message: "Invalid number of rooms" });
    }

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
        floor: null, 
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
    const rooms = await Room.find()
      .populate("assignedTo", "name email")
      .populate("floor", "floorNumber"); // 🔥 NEW

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching rooms" });
  }
};

// ===== GET AVAILABLE ROOMS =====
const getAvailableRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isOccupied: false })
      .populate("floor", "floorNumber"); // optional

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error fetching available rooms" });
  }
};

// ===== ASSIGN ROOM TO STUDENT =====
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

// ===== ASSIGN ROOM TO FLOOR ===== 🔥 NEW
const assignRoomToFloor = async (req, res) => {
  try {
    const { roomId, floorId } = req.body;

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.floor = floorId;
    await room.save();

    res.json({ message: "Room assigned to floor successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to assign room to floor" });
  }
};

// ===== BULK ASSIGN ROOMS TO FLOOR =====


const bulkAssignRoomsToFloor = async (req, res) => {
  try {
    const { start, end, floorId, force } = req.body;

    const roomNumbers = [];
    for (let i = start; i <= end; i++) {
      roomNumbers.push(`R-${i}`);
    }

    // 🔍 find already assigned rooms
    const alreadyAssigned = await Room.find({
      roomNumber: { $in: roomNumbers },
      floor: { $ne: null },
    });

    // ❌ block only if NOT force
    if (alreadyAssigned.length > 0 && !force) {
      return res.status(400).json({
        message: "Rooms already assigned",
        rooms: alreadyAssigned.map((r) => r.roomNumber),
      });
    }

    // ✅ allow overwrite
    const result = await Room.updateMany(
      { roomNumber: { $in: roomNumbers } },
      { $set: { floor: floorId } }
    );

    res.json({
      message: "Rooms assigned successfully",
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Bulk assignment failed" });
  }
};
const deleteAllRooms = async (req, res) => {
  try {
    // OPTIONAL SAFETY CHECK (recommended for admin only)
    // if (req.user.role !== "admin") {
    //   return res.status(403).json({ message: "Access denied" });
    // }

    // Step 1: Unassign rooms from users
    await User.updateMany(
      { room: { $ne: null } },
      { $set: { room: null } }
    );

    // Step 2: Delete all rooms
    const result = await Room.deleteMany({});

    res.json({
      message: "All rooms deleted successfully",
      deletedCount: result.deletedCount,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete rooms" });
  }
};

module.exports = {
  createRooms,
  getAllRooms,
  getAvailableRooms,
  assignRoom,
  unassignRoom,
  assignRoomToFloor, // NEW EXPORT
  bulkAssignRoomsToFloor,
  deleteAllRooms,
};