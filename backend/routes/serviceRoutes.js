const express = require("express");

const router = express.Router();

const cmsUpload = require("../middleware/cmsUpload");

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} = require("../controllers/serviceController");



// CREATE SERVICE
router.post(
  "/",
  cmsUpload.single("image"),
  createService
);



// GET ALL SERVICES
router.get("/", getServices);



// GET SINGLE SERVICE
router.get("/:id", getServiceById);



// UPDATE SERVICE
router.put(
  "/:id",
  cmsUpload.single("image"),
  updateService
);



// DELETE SERVICE
router.delete("/:id", deleteService);



module.exports = router;

