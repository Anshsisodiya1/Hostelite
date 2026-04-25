const express = require("express");
const router = express.Router();

const {
  createRooms,
  getAllRooms,
  getAvailableRooms,
  assignRoom,
  unassignRoom,
  assignRoomToFloor,
  bulkAssignRoomsToFloor,
} = require("../controllers/room.controller");

// existing routes
router.post("/create", createRooms);
router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);
router.put("/assign", assignRoom);
router.put("/unassign", unassignRoom);

// 🔥 ADD THESE TWO IMPORTANT ROUTES
router.put("/assign-floor", assignRoomToFloor);
router.put("/bulk-assign-floor", bulkAssignRoomsToFloor);

module.exports = router;