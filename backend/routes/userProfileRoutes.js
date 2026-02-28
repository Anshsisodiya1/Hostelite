const express = require("express");
const router = express.Router();

const profileController = require("../controllers/userProfileController");
const pdfController = require("../controllers/pdfController");

const {
  authMiddleware,
  isAdmin,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/multer");

console.log("User Profile Routes Loaded");
//   STUDENT SUBMIT PROFILE
router.post(
  "/submit",
  authMiddleware,
  upload.fields([
    { name: "aadhaarPhoto", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  profileController.submitProfile
);


//   STUDENT VIEW OWN PROFILE

router.get("/me", authMiddleware, profileController.getMyProfile);

   // ADMIN ROUTES


//  GET PROFILE BY USER ID
router.get(
  "/user/:userId",
  authMiddleware,
  isAdmin,
  profileController.getProfileByUserId
);


// Get all profiles
router.get(
  "/all",
  authMiddleware,
  isAdmin,
  profileController.getAllProfiles
);

// Download profile PDF (put BEFORE /:id)
router.get(
  "/download/:id",
  authMiddleware,
  isAdmin,
  pdfController.downloadProfilePDF
);

// Get single profile by ID
router.get(
  "/:id",
  authMiddleware,
  isAdmin,
  profileController.getProfileById
);

// Edit profile
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  profileController.adminEditProfile
);

module.exports = router;
