const User = require("../models/User");

const getFloorStudents = async (req, res) => {
  try {
    const { floor } = req.user; // logged-in warden ka floor

    const students = await User.find({
      role: "student",
      floor: floor,
    }).select("name email roomNumber studentId floor");

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch floor students",
    });
  }
};

module.exports = {
  getFloorStudents,
};