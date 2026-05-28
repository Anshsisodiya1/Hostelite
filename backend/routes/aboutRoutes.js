const express = require("express");

const router = express.Router();

const {
  getAboutSection,
  updateAboutSection,
} = require("../controllers/aboutController");



// GET ABOUT SECTION
router.get("/", getAboutSection);



// UPDATE ABOUT SECTION
router.put("/", updateAboutSection);



module.exports = router;
