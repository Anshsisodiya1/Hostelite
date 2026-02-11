const express = require("express");
const router = express.Router();

const {
  createRooms,
  getAllRooms,
  getAvailableRooms,
  assignRoom,
  unassignRoom,
} = require("../controllers/room.controller");

router.post("/create", createRooms);
router.get("/", getAllRooms);
router.get("/available", getAvailableRooms);
router.put("/assign", assignRoom);
router.put("/unassign", unassignRoom);

module.exports = router;
