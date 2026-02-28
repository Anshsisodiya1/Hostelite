const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["student", "warden"],
      required: true,
    },

    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    motherName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    aadhaarNumber: { type: String, required: true },
    aadhaarPhoto: { type: String, required: true },
    aadhaarFileId: { type: String }, // ImageKit file ID for deletion
    profilePhoto: { type: String, required: true },
    profileFileId: { type: String }, // ImageKit file ID for deletion
    permanentAddress: { type: String, required: true },

    studentType: {
      type: String,
      enum: ["university_student", "working_professional"],
    },

    universityName: String,
    companyName: String,

    submitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);