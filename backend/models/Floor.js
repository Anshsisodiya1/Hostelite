// models/Floor.js
const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema({
  floorNumber: Number,
  warden: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

module.exports = mongoose.model("Floor", floorSchema);