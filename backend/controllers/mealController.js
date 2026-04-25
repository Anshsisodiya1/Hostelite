const Meal = require("../models/Meal");
const User = require("../models/User");
const sendMealMail = require("../config/sendMail"); 

// WARDEN → create/update today meal
exports.saveTodayMeal = async (req, res) => {
  try {
    const { breakfast, lunch, dinner } = req.body;

    const today = new Date().toISOString().split("T")[0];

    const meal = await Meal.findOneAndUpdate(
      { date: today },
      {
        breakfast,
        lunch,
        dinner,
        updatedBy: req.user._id,
      },
      { new: true, upsert: true }
    );

    // 🔥 GET STUDENT EMAILS
    const students = await User.find({ role: "student" }).select("email");

    const emails = students
      .map((s) => s.email)
      .filter(Boolean);

    console.log("📩 Emails found:", emails); // DEBUG

    // 🔥 SEND MAIL
    if (emails.length > 0) {
      try {
        await sendMealMail(emails, meal);
        console.log("✅ Mail sent successfully");
      } catch (mailErr) {
        console.error("❌ Mail error:", mailErr);
      }
    }

    res.status(200).json({
      message: "Meal updated & notifications sent",
      meal,
    });

  } catch (error) {
    console.error("❌ Controller error:", error);
    res.status(500).json({ message: "Failed to save meal" });
  }
};

// STUDENT → get today meal
exports.getTodayMeal = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const meal = await Meal.findOne({ date: today });

    res.status(200).json(meal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch meal" });
  }
};
