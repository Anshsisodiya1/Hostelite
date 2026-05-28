const User = require("../models/User");
const Room = require("../models/Room");
const UserProfile = require("../models/UserProfile");

const getFloorStudents = async (req, res) => {
  try {
    const floor = req.user.floor;

    // rooms of this floor
    const rooms = await Room.find({ floor });

    // students
    const students = await User.find({
      role: "student",
    }).populate("room");

    // filter students of same floor
    const floorStudents = [];

    for (const student of students) {
      if (
        student.room &&
        student.room.floor &&
        student.room.floor.toString() === floor.toString()
      ) {
        const profile = await UserProfile.findOne({
          user: student._id,
        });

        floorStudents.push({
          _id: student._id,
          name: student.name,
          email: student.email,
          roomNumber: student.room?.roomNumber || null,
          phone: profile?.phone || null,
          branch: profile?.branch || null,
          status: "active",
        });
      }
    }

    const occupiedRooms = rooms.filter((r) => r.isOccupied).length;
    const vacantRooms = rooms.length - occupiedRooms;

    res.status(200).json({
      success: true,
      totalRooms: rooms.length,
      occupiedRooms,
      vacantRooms,
      totalStudents: floorStudents.length,
      rooms,
      students: floorStudents,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warden dashboard data",
    });
  }
};

module.exports = { getFloorStudents };