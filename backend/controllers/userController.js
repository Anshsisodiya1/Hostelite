const User = require("../models/User");

// Logged-in user profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("room", "roomNumber") // 👈 VERY IMPORTANT
      .select("-password");

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};


// Admin: get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
  .populate("room")
  .select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Admin: update user details including role and roomNumber
const Room = require("../models/Room");

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, room } = req.body; // receive room ObjectId

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update basic fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    // ===== ROOM LOGIC =====
    if (room !== undefined) {
      // If user already has a room, free that room first
      if (user.room) {
        const oldRoom = await Room.findById(user.room);
        if (oldRoom) {
          oldRoom.isOccupied = false;
          oldRoom.assignedTo = null;
          await oldRoom.save();
        }
      }

      // If new room selected
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
        // If admin removed room
        user.room = null;
      }
    }

    await user.save();

    const updatedUser = await User.findById(id)
      .populate("room")
      .select("-password");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Admin: delete user
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

// Get user profile by ID (admin)
const getUserByIdWithProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

module.exports = {
  getMyProfile,
  getAllUsers,
  updateUser,
  deleteUser,
    getUserByIdWithProfile,
};
