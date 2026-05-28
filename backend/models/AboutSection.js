const mongoose = require("mongoose");

const aboutSectionSchema = new mongoose.Schema(
  {
    title: String,

    description: String,

    highlights: [
      {
        icon: String,
        text: String,
      },
    ],

    features: [
      {
        icon: String,
        heading: String,
        text: String,
      },
    ],

    badges: [
      {
        icon: String,
        text: String,
      },
    ],

    stats: [
      {
        number: String,
        label: String,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutSection", aboutSectionSchema);