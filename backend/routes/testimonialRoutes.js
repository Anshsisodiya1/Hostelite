const express = require("express");

const router = express.Router();

const cmsUpload = require("../middleware/cmsUpload");

const {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialController");



// CREATE TESTIMONIAL
router.post(
  "/",
  cmsUpload.single("avatar"),
  createTestimonial
);



// GET ALL TESTIMONIALS
router.get("/", getTestimonials);



// GET SINGLE TESTIMONIAL
router.get("/:id", getTestimonialById);



// UPDATE TESTIMONIAL
router.put(
  "/:id",
  cmsUpload.single("avatar"),
  updateTestimonial
);



// DELETE TESTIMONIAL
router.delete("/:id", deleteTestimonial);



module.exports = router;

