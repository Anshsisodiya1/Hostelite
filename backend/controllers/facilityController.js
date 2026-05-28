const Facility = require("../models/Facility");

// CREATE FACILITY
const createFacility = async (req, res) => {
  try {
    const facility = await Facility.create({
      title: req.body.title,

      description: req.body.description,

      icon: req.body.icon || "🏢",

      order: req.body.order || 0,

      image: req.file
        ? `/${req.file.path.replace(/\\/g, "/")}`
        : "",
    });

    res.status(201).json({
      success: true,
      message: "Facility created successfully",
      facility,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET ALL FACILITIES
const getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find().sort({
      order: 1,
    });

    res.status(200).json({
      success: true,
      facilities,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// GET SINGLE FACILITY
const getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    res.status(200).json({
      success: true,
      facility,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE FACILITY
const updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    facility.title =
      req.body.title || facility.title;

    facility.description =
      req.body.description || facility.description;

    facility.icon =
      req.body.icon || facility.icon;

    facility.order =
      req.body.order || facility.order;

    if (req.file) {
      facility.image =
        `/${req.file.path.replace(/\\/g, "/")}`;
    }

    await facility.save();

    res.status(200).json({
      success: true,
      message: "Facility updated successfully",
      facility,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// DELETE FACILITY
const deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found",
      });
    }

    await facility.deleteOne();

    res.status(200).json({
      success: true,
      message: "Facility deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacility,
  deleteFacility,
};

