const UserProfile = require("../models/UserProfile");

/* ── helper: convert stored file path → full browser URL ── */
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://hostelite-1.onrender.com/"  // ✅ hardcoded, no env variable needed
    : "http://localhost:5001/";             // ✅ correct local port

function toUrl(filePath) {
  if (!filePath) return null;
  if (filePath.startsWith("http")) return filePath;
  return BASE_URL + filePath.replace(/\\/g, "/");
}

function applyUrls(obj) {
  if (obj.profilePhoto) obj.profilePhoto = toUrl(obj.profilePhoto);
  if (obj.aadhaarPhoto) obj.aadhaarPhoto = toUrl(obj.aadhaarPhoto);
  return obj;
}
/* ===========================
   STUDENT SUBMIT PROFILE
=========================== */
exports.submitProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingProfile = await UserProfile.findOne({ user: userId });
    if (existingProfile && existingProfile.submitted) {
      return res.status(400).json({ message: "Profile already submitted" });
    }

    console.log("FILES RECEIVED:", req.files);

    if (!req.files?.aadhaarPhoto || !req.files?.profilePhoto) {
      return res.status(400).json({ message: "All documents required" });
    }

    // ✅ Only save relative path using filename
    const aadhaarPath = "uploads/" + req.files.aadhaarPhoto[0].filename;
    const profilePath = "uploads/" + req.files.profilePhoto[0].filename;

    console.log("PATHS:", { aadhaarPath, profilePath });

    const profileData = {
      user: userId,
      role: req.user.role,
      fullName: req.body.fullName,
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      phone: req.body.phone,
      address: req.body.address,
      permanentAddress: req.body.address,
      aadhaarNumber: req.body.aadhaarNumber,
      aadhaarPhoto: aadhaarPath,   // ✅ relative path
      profilePhoto: profilePath,   // ✅ relative path
      submitted: true,
    };

    const profile = await UserProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      { upsert: true, new: true }
    );

    console.log("SAVED PROFILE:", profile);

    const profileObj = applyUrls(profile.toObject());
    res.status(201).json({
      message: "Profile submitted successfully",
      profile: profileObj,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
/* ===========================
   STUDENT VIEW OWN PROFILE
=========================== */
exports.getMyProfile = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profileObj = applyUrls(profile.toObject());
    res.json(profileObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* ===========================
   ADMIN GET ALL PROFILES
=========================== */
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await UserProfile.find().populate("user", "email role");

    const result = profiles.map((p) => applyUrls(p.toObject()));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* ===========================
   ADMIN GET PROFILE BY USER ID
=========================== */
exports.getProfileByUserId = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      user: req.params.userId,
    }).populate("user", "email role");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profileObj = applyUrls(profile.toObject());
    res.json(profileObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

/* ===========================
   ADMIN GET SINGLE PROFILE
   (by profile _id)
=========================== */
exports.getProfileById = async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.params.id).populate(
      "user",
      "email role",
    );

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profileObj = applyUrls(profile.toObject());
    res.json(profileObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/* ===========================
   ADMIN EDIT PROFILE
=========================== */
exports.adminEditProfile = async (req, res) => {
  try {
    // Only include fields that were actually sent
    const allowedUpdates = {};
    const fields = [
      "fullName",
      "fatherName",
      "motherName",
      "phone",
      "address",
      "permanentAddress",
      "aadhaarNumber",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) allowedUpdates[f] = req.body[f];
    });

    // Sync address → permanentAddress
    if (allowedUpdates.address && !allowedUpdates.permanentAddress) {
      allowedUpdates.permanentAddress = allowedUpdates.address;
    }

    const profile = await UserProfile.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates }, // $set prevents wiping other fields
      { new: true },
    ).populate("user", "email role");

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const profileObj = applyUrls(profile.toObject());
    res.json({ message: "Profile updated successfully", profile: profileObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
