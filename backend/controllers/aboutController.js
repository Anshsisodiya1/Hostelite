const AboutSection = require("../models/AboutSection");

// GET ABOUT SECTION
const getAboutSection = async (req, res) => {
  try {
    const about = await AboutSection.findOne();

    res.status(200).json({
      success: true,
      about,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE ABOUT SECTION
const updateAboutSection = async (req, res) => {
  try {
    let about = await AboutSection.findOne();

    if (!about) {
      about = new AboutSection();
    }

    about.title =
      req.body.title || about.title;

    about.description =
      req.body.description || about.description;

    about.highlights =
      req.body.highlights || about.highlights;

    about.features =
      req.body.features || about.features;

    about.badges =
      req.body.badges || about.badges;

    about.stats =
      req.body.stats || about.stats;

    about.isActive =
      req.body.isActive ?? about.isActive;

    await about.save();

    res.status(200).json({
      success: true,
      message: "About section updated successfully",
      about,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  getAboutSection,
  updateAboutSection,
};
