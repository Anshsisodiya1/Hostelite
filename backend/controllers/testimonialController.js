const Testimonial = require("../models/Testimonial");

// CREATE TESTIMONIAL
const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create({
      studentName: req.body.studentName,

      course: req.body.course,

      review: req.body.review,

      rating: req.body.rating || 5,

      avatar: req.file
        ? `/${req.file.path.replace(/\\/g, "/")}`
        : "",
    });

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      testimonial,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET ALL TESTIMONIALS
const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      testimonials,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET SINGLE TESTIMONIAL
const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      testimonial,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE TESTIMONIAL
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    testimonial.studentName =
      req.body.studentName || testimonial.studentName;

    testimonial.course =
      req.body.course || testimonial.course;

    testimonial.review =
      req.body.review || testimonial.review;

    testimonial.rating =
      req.body.rating || testimonial.rating;

    if (req.file) {
      testimonial.avatar =
        `/${req.file.path.replace(/\\/g, "/")}`;
    }

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// DELETE TESTIMONIAL
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.deleteOne();

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};

