const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ================= BASIC INFO =================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "warden", "admin"],
      default: "student",
    },

    // ================= STUDENT ROOM =================
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null,
    },

    // ================= WARDEN FLOOR =================
    floor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      default: null,
    },

    // ================= OPTIONAL =================
    hostelName: {
      type: String,
      default: "Hostelite",
    },

    otp: String,
    otpExpires: Date,
    deviceToken: String,
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   🔥 SAFE ROLE SWITCH LOGIC (IMPORTANT FOR PRODUCTION)
   ========================================================= */
userSchema.pre("save", function (next) {
  // If student → remove floor
  if (this.role === "student") {
    this.floor = null;
  }

  // If warden → remove room
  if (this.role === "warden") {
    this.room = null;
  }

  // If admin → clear both (clean state)
  if (this.role === "admin") {
    this.room = null;
    this.floor = null;
  }

  next();
});

/* =========================================================
   🔥 SAFE UPDATE HOOK (prevents stale assignments on update)
   ========================================================= */
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (!update) return next();

  const role = update.role;

  if (role === "student") {
    update.floor = null;
  }

  if (role === "warden") {
    update.room = null;
  }

  if (role === "admin") {
    update.room = null;
    update.floor = null;
  }

  this.setUpdate(update);
  next();
});

module.exports = mongoose.model("User", userSchema);