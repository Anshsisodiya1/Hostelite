const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const UserProfile = require("../models/UserProfile");


exports.downloadProfilePDF = async (req, res) => {
  try {
    //  FIX 1: Find by user ID (not profile _id)
    const profile = await UserProfile.findOne({ user: req.params.id })
      .populate("user", "email role");

    //  FIX 2: Prevent crash if profile not found
    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${profile.fullName || "student_profile"}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Logo
    const logoPath = path.join(__dirname, "../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { fit: [100, 100], align: "center" });
    }
    

    doc.moveDown();
    doc.fontSize(18).text("User Profile Information", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Full Name: ${profile.fullName}`);
    doc.text(`Father Name: ${profile.fatherName}`);
    doc.text(`Mother Name: ${profile.motherName}`);
    doc.text(`Email: ${profile.user?.email || "N/A"}`);
    doc.text(`Phone.No: ${profile.user?.phone || "N/A"}`);
    doc.text(`Role: ${profile.role}`);
    doc.text(`Aadhaar Number: ${profile.aadhaarNumber}`);
    doc.text(`Permanent Address: ${profile.permanentAddress || profile.address}`);
    doc.moveDown();

    // Profile Photo (Fix path properly)
    if (profile.profilePhoto) {
      const profilePhotoPath = path.join(
        __dirname,
        "..",
        profile.profilePhoto
      );

      if (fs.existsSync(profilePhotoPath)) {
        doc.text("Profile Photo:");
        doc.image(profilePhotoPath, { fit: [150, 150] });
        doc.moveDown();
      }
    }

    // Aadhaar Photo (Fix path properly)
    if (profile.aadhaarPhoto) {
      const aadhaarPhotoPath = path.join(
        __dirname,
        "..",
        profile.aadhaarPhoto
      );

      if (fs.existsSync(aadhaarPhotoPath)) {
        doc.text("Aadhaar Document:");
        doc.image(aadhaarPhotoPath, { fit: [250, 200] });
        doc.moveDown();
      }
    }

    doc.end();
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({
      message: "Error generating PDF",
    });
  }
};