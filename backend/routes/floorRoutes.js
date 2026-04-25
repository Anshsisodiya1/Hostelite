const express = require("express");
const router = express.Router();

const {
  createFloor,
  getFloors,
  assignWarden,
  updateFloor,
  deleteFloor,
} = require("../controllers/floor.controller");
console.log("Floor routes loaded");
// routes
router.post("/", createFloor);
router.get("/", getFloors);
router.put("/:id/assign-warden", assignWarden);
router.put("/:id", updateFloor);
router.delete("/:id", deleteFloor);

module.exports = router;
