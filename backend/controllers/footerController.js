const Footer = require("../models/Footer");

// GET FOOTER
const getFooter = async (req, res) => {
  try {
    const footer = await Footer.findOne();

    res.status(200).json({
      success: true,
      footer,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE FOOTER
const updateFooter = async (req, res) => {
  try {
    let footer = await Footer.findOne();

    if (!footer) {
      footer = new Footer();
    }

    footer.footerDescription =
      req.body.footerDescription ||
      footer.footerDescription;

    footer.email =
      req.body.email || footer.email;

    footer.phone =
      req.body.phone || footer.phone;

    footer.address =
      req.body.address || footer.address;

    footer.copyrightText =
      req.body.copyrightText ||
      footer.copyrightText;

    footer.socialLinks = {
      instagram:
        req.body.instagram ||
        footer.socialLinks.instagram,

      linkedin:
        req.body.linkedin ||
        footer.socialLinks.linkedin,

      twitter:
        req.body.twitter ||
        footer.socialLinks.twitter,

      facebook:
        req.body.facebook ||
        footer.socialLinks.facebook,
    };

    await footer.save();

    res.status(200).json({
      success: true,
      message: "Footer updated successfully",
      footer,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



module.exports = {
  getFooter,
  updateFooter,
};
