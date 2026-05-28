const mongoose = require("mongoose");

const footerSchema = new mongoose.Schema(
  {
    footerDescription: {
      type: String,
      default:
        "Modern hostel management platform designed to simplify student accommodation.",
    },

    email: {
      type: String,
      default: "support@hostelite.com",
    },

    phone: {
      type: String,
      default: "+91 98765 43210",
    },

    address: {
      type: String,
      default: "India",
    },

    copyrightText: {
      type: String,
      default: "All rights reserved.",
    },

    socialLinks: {
      instagram: String,
      linkedin: String,
      twitter: String,
      facebook: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Footer", footerSchema);