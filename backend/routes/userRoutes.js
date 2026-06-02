const express = require("express");

const {
  getMyProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByIdWithProfile,
  getDashboardContacts,
} = require("../controllers/userController");

const { authMiddleware } = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/* =========================================================
   USER PROFILE
   ========================================================= */

// Get logged-in user's profile
router.get("/me", authMiddleware, getMyProfile);

/* =========================================================
   DASHBOARD CONTACTS
   Student -> Admin + Assigned Warden
   Warden  -> Admin Only
   ========================================================= */

router.get(
  "/dashboard-contacts",
  authMiddleware,
  getDashboardContacts
);

/* =========================================================
   ADMIN ONLY ROUTES
   ========================================================= */

// Get all users
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllUsers
);

// Get counts of admins and wardens
router.get(
  "/role-counts",
  authMiddleware,
  roleMiddleware(["admin"]),
  async (req, res) => {
    try {
      const User = require("../models/User");

      const adminCount = await User.countDocuments({
        role: "admin",
      });

      const wardenCount = await User.countDocuments({
        role: "warden",
      });

      res.status(200).json({
        adminCount,
        wardenCount,
      });
    } catch (err) {
      console.error("Role Count Error:", err);

      res.status(500).json({
        message: "Failed to fetch role counts",
      });
    }
  }
);

// Get single user profile by ID
router.get(
  "/:id/profile",
  authMiddleware,
  roleMiddleware(["admin"]),
  getUserByIdWithProfile
);

// Update user
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateUser
);

// Delete user
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteUser
);

module.exports = router;