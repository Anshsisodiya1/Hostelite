const mongoose = require("mongoose");

const heroSectionSchema = new mongoose.Schema(
  {
    badge: {
      type: String,
      default: "🎓 Trusted by 10,000+ Students",
    },

    titleLine1: {
      type: String,
      required: true,
      default: "Smart Hostel",
    },

    titleLine2: {
      type: String,
      required: true,
      default: "Management",
    },

    description: {
      type: String,
      required: true,
    },

    highlightText: {
      type: String,
      default: "Experience seamless hostel living",
    },

    primaryButtonText: {
      type: String,
      default: "Get Started",
    },

    secondaryButtonText: {
      type: String,
      default: "Learn More",
    },

    heroImage: {
      type: String,
      default: "",
    },

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

module.exports = mongoose.model("HeroSection", heroSectionSchema);