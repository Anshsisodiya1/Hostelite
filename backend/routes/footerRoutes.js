const express = require("express");

const router = express.Router();

const {
  getFooter,
  updateFooter,
} = require("../controllers/footerController");



// GET FOOTER
router.get("/", getFooter);



// UPDATE FOOTER
router.put("/", updateFooter);



module.exports = router;
