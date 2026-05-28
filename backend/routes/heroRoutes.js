const express = require("express");

const router = express.Router();

const cmsUpload = require("../middleware/cmsUpload");

const {
  getHeroSection,
  updateHeroSection,
} = require("../controllers/heroController");



// GET HERO SECTION
router.get("/", getHeroSection);



// UPDATE HERO SECTION
router.put(
  "/",
  cmsUpload.single("heroImage"),
  updateHeroSection
);



module.exports = router;

