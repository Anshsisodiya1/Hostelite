const express = require("express");
const {
  createRoomRequest,
  getWardenRequests,
  getWardenPendingCount,
  approveRoomRequest,
  rejectRoomRequest,
  getAllRequests,
  cancelRoomRequest,
} = require("../controllers/roomRequestController");


const { authMiddleware, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// ── Admin routes ──────────────────────────────
router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  createRoomRequest
);

router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("admin"),
  getAllRequests
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  cancelRoomRequest
);

// ── Warden routes ─────────────────────────────
router.get(
  "/warden",
  authMiddleware,
  authorizeRoles("warden"),
  getWardenRequests
);

router.get(
  "/warden/pending-count",
  authMiddleware,
  authorizeRoles("warden"),
  getWardenPendingCount
);

router.patch(
  "/:id/approve",
  authMiddleware,
  authorizeRoles("warden"),
  approveRoomRequest
);

router.patch(
  "/:id/reject",
  authMiddleware,
  authorizeRoles("warden"),
  rejectRoomRequest
);

module.exports = router;