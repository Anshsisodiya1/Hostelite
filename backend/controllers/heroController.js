const HeroSection = require("../models/HeroSection");

// GET HERO SECTION
const getHeroSection = async (req, res) => {
  try {
    const hero = await HeroSection.findOne();

    res.status(200).json({
      success: true,
      hero,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE HERO SECTION
const updateHeroSection = async (req, res) => {
  try {
    let hero = await HeroSection.findOne();

    if (!hero) {
      hero = new HeroSection();
    }

    hero.badge = req.body.badge || hero.badge;

    hero.titleLine1 =
      req.body.titleLine1 || hero.titleLine1;

    hero.titleLine2 =
      req.body.titleLine2 || hero.titleLine2;

    hero.description =
      req.body.description || hero.description;

    hero.highlightText =
      req.body.highlightText || hero.highlightText;

    hero.primaryButtonText =
      req.body.primaryButtonText || hero.primaryButtonText;

    hero.secondaryButtonText =
      req.body.secondaryButtonText || hero.secondaryButtonText;

    if (req.file) {
      hero.heroImage =
        `/${req.file.path.replace(/\\/g, "/")}`;
    }

    await hero.save();

    res.status(200).json({
      success: true,
      message: "Hero section updated successfully",
      hero,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  getHeroSection,
  updateHeroSection,
};

