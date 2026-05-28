const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: true,
    },

    course: {
      type: String,
      required: true,
    },

    review: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 5,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);