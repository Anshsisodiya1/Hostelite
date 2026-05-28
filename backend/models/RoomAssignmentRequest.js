const mongoose = require("mongoose");

const roomAssignmentRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    room:    { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    floor:   { type: mongoose.Schema.Types.ObjectId, ref: "Floor", required: true },
    requestedBy:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedWarden:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    wardenNote: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RoomAssignmentRequest", roomAssignmentRequestSchema);