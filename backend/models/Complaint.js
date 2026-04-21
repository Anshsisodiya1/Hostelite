const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    warden: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      trim: true,
    },

    // ✅ UPDATED STATUS (more realistic)
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },

    // ✅ NEW FIELD (Priority / Severity)
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // ✅ OPTIONAL (for notification tracking)
    isNotified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);