const User = require("../models/User");
const Room = require("../models/Room");
const Floor = require("../models/Floor");

// ================= MY PROFILE =================
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "room",
        populate: {
          path: "floor",        
          select: "floorNumber"
        }
      })
      .populate("floor", "floorNumber") 
      .select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// ================= GET ALL USERS =================
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("room")
      .populate("floor")
      .select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, room, floor } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // ===== BASIC INFO =====
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // ================= ROOM LOGIC =================
    if (room !== undefined) {
      if (user.room) {
        const oldRoom = await Room.findById(user.room);
        if (oldRoom) {
          oldRoom.isOccupied = false;
          oldRoom.assignedTo = null;
          await oldRoom.save();
        }
      }

      if (room) {
        const newRoom = await Room.findById(room);
        if (!newRoom)
          return res.status(404).json({ message: "Room not found" });

        if (newRoom.isOccupied)
          return res.status(400).json({ message: "Room already occupied" });

        newRoom.isOccupied = true;
        newRoom.assignedTo = user._id;
        await newRoom.save();

        user.room = room;
      } else {
        user.room = null;
      }
    }

    // ================= FLOOR LOGIC (🔥 FIXED) =================
    if (floor !== undefined) {
      if (floor) {
        const newFloor = await Floor.findById(floor);
        if (!newFloor)
          return res.status(404).json({ message: "Floor not found" });

        user.floor = floor;
      } else {
        user.floor = null;
      }
    }

    await user.save();

    const updatedUser = await User.findById(id)
      .populate("room")
      .populate("floor")
      .select("-password");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= DELETE USER =================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// ================= GET USER BY ID =================
const getUserByIdWithProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("room")
      .populate("floor")
      .select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// ================= SAVE TOKEN =================
const saveToken = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { deviceToken: req.body.token },
      { new: true },
    );

    res.json({ message: "Token saved", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashbaord Contacts

const getDashboardContacts = async (req, res) => {
  try {
    const currentUser = req.user;

    // Get Admin
    const admin = await User.findOne({ role: "admin" }).select(
      "-password -otp -otpExpires -twoFactorSecret",
    );

    let warden = null;

    // If student, fetch assigned warden
    if (currentUser.role === "student") {
      const student = await User.findById(currentUser.id).populate("floor");

      if (student?.floor) {
        warden = await User.findOne({
          role: "warden",
          floor: student.floor._id,
        }).select("-password -otp -otpExpires -twoFactorSecret");
      }
    }

    return res.status(200).json({
      success: true,
      admin,
      warden,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
    });
  }
};

module.exports = {
  getMyProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByIdWithProfile,
  saveToken,
  getDashboardContacts,
};
