const express = require("express");
const {
  getMyProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByIdWithProfile,
} = require("../controllers/userController"); 
const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");



const router = express.Router();


// Get logged-in user's profile
router.get("/me", authMiddleware, getMyProfile);

// Get all users (admin only)
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

// Get single user by ID with profile (admin only)
router.get("/:id/profile", authMiddleware, roleMiddleware(["admin"]), getUserByIdWithProfile);

// Update user details (admin only)
router.put("/:id", authMiddleware, roleMiddleware(["admin"]), updateUser);


// Delete user (admin only)
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

// Get counts of admins and wardens (admin only)
router.get("/role-counts", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
  try {
    const adminCount = await require("../models/User").countDocuments({ role: "admin" });
    const wardenCount = await require("../models/User").countDocuments({ role: "warden" });

    res.json({ adminCount, wardenCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch role counts" });
  }
});


module.exports = router;
