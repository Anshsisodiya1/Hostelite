const express = require("express");

const router = express.Router();

const {
  getLandingPageData,
} = require("../controllers/cmsController");



router.get(
  "/landing-page",
  getLandingPageData
);



module.exports = router;