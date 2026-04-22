const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMealUpdateMail = async (emails, mealData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emails,
    subject: "🍽️ Today's Meal Updated - Hostelite",
    html: `
      <h2>Today's Meal Update</h2>
      <p><b>Breakfast:</b> ${mealData.breakfast}</p>
      <p><b>Lunch:</b> ${mealData.lunch}</p>
      <p><b>Dinner:</b> ${mealData.dinner}</p>
      <br/>
      <p>Have a great day!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMealUpdateMail;