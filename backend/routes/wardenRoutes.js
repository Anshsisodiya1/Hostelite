const express = require("express");
const router = express.Router();

const { getFloorStudents } = require("../controllers/wardenController");
const {authMiddleware} = require("../middleware/authMiddleware");

router.get("/students", authMiddleware, getFloorStudents);

module.exports = router;