const HeroSection = require("../models/HeroSection");
const AboutSection = require("../models/AboutSection");
const Facility = require("../models/Facility");
const Service = require("../models/Service");
const Testimonial = require("../models/Testimonial");
const Footer = require("../models/Footer");



const getLandingPageData = async (req, res) => {
  try {
    const hero = await HeroSection.findOne();

    const about = await AboutSection.findOne();

    const facilities = await Facility.find({
      isActive: true,
    });

    const services = await Service.find({
      isActive: true,
    });

    const testimonials = await Testimonial.find({
      isActive: true,
    });

    const footer = await Footer.findOne();

    res.status(200).json({
      success: true,

      data: {
        hero,
        about,
        facilities,
        services,
        testimonials,
        footer,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getLandingPageData,
};