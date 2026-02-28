const UserProfile = require("../models/UserProfile");

/* ===========================
   STUDENT SUBMIT PROFILE
=========================== */
exports.submitProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const existingProfile = await UserProfile.findOne({ user: userId });

    if (existingProfile && existingProfile.submitted) {
      return res.status(400).json({
        message: "Profile already submitted",
      });
    }

    if (!req.files?.aadhaarPhoto || !req.files?.profilePhoto) {
      return res.status(400).json({
        message: "All documents required",
      });
    }

    const profileData = {
      user: userId,
      role: req.user.role,
      ...req.body,
      aadhaarPhoto: req.files.aadhaarPhoto[0].path,
      profilePhoto: req.files.profilePhoto[0].path,
      submitted: true,
    };

    const profile = await UserProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: "Profile submitted successfully",
      profile,
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
    const profile = await UserProfile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const profileObj = profile.toObject();

    // Convert file path to browser URL
    if (profileObj.profilePhoto) {
      profileObj.profilePhoto =
        "http://localhost:5000/" +
        profileObj.profilePhoto.replace(/\\/g, "/");
    }

    if (profileObj.aadhaarPhoto) {
      profileObj.aadhaarPhoto =
        "http://localhost:5000/" +
        profileObj.aadhaarPhoto.replace(/\\/g, "/");
    }

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
    const profiles = await UserProfile.find()
      .populate("user", "email role");

    res.json(profiles);
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
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};


/* ===========================
   ADMIN GET SINGLE PROFILE
   (FIXED — now uses profile _id)
=========================== */
exports.getProfileById = async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.params.id)
      .populate("user", "email role");

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json(profile);
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
    const allowedUpdates = {
      fullName: req.body.fullName,
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      phone: req.body.phone,
      address: req.body.address,
      aadhaarNumber: req.body.aadhaarNumber,
    };

    const profile = await UserProfile.findByIdAndUpdate(
      req.params.id,   // using profile _id
      allowedUpdates,
      { new: true }
    ).populate("user", "email role"); // important for frontend

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    res.json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update profile",
    });
  }
};