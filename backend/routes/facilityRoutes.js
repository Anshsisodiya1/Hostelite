const express = require("express");

const router = express.Router();

const cmsUpload = require("../middleware/cmsUpload");

const {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
} = require("../controllers/facilityController");



// CREATE FACILITY
router.post(
  "/",
  cmsUpload.single("image"),
  createFacility
);



// GET ALL FACILITIES
router.get("/", getFacilities);



// GET SINGLE FACILITY
router.get("/:id", getFacilityById);



// UPDATE FACILITY
router.put(
  "/:id",
  cmsUpload.single("image"),
  updateFacility
);



// DELETE FACILITY
router.delete("/:id", deleteFacility);



module.exports = router;
