const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      default: "⚡",
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    stats: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);