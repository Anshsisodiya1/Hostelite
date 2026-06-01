const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const fs = require("fs");
const path = require("path");

const app = express();

connectDB();


// CORS

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://hostelite-red.vercel.app",
    ],
    credentials: true,
  })
);
app.options("*", cors());



// ENSURE UPLOADS DIRECTORY EXISTS

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });

  console.log("Created uploads/ directory");
}


// MIDDLEWARE

app.use(express.json());


// STATIC FILES

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


// EXISTING ROUTES

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/users", require("./routes/userRoutes"));

app.use(
  "/api/complaints",
  require("./routes/complaintRoutes")
);

app.use(
  "/api/payments",
  require("./routes/paymentRoutes")
);

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/rooms", require("./routes/room.routes"));

app.use(
  "/api/system-settings",
  require("./routes/systemSettings.routes")
);

app.use("/api/meals", require("./routes/mealRoutes"));

app.use(
  "/api/profile",
  require("./routes/userProfileRoutes")
);

app.use("/api/floors", require("./routes/floorRoutes"));

app.use("/api/reports", require("./routes/reports"));

app.use("/api/warden", require("./routes/wardenRoutes"));

app.use(
  "/api/room-requests",
  require("./routes/roomRequestRoutes")
);


// CMS ROUTES

// HERO
app.use(
  "/api/hero",
  require("./routes/heroRoutes")
);

// ABOUT
app.use(
  "/api/about",
  require("./routes/aboutRoutes")
);

// FACILITIES
app.use(
  "/api/facilities",
  require("./routes/facilityRoutes")
);

// SERVICES
app.use(
  "/api/services",
  require("./routes/serviceRoutes")
);

// TESTIMONIALS
app.use(
  "/api/testimonials",
  require("./routes/testimonialRoutes")
);

// FOOTER
app.use(
  "/api/footer",
  require("./routes/footerRoutes")
);

// COMBINED CMS API
app.use(
  "/api/cms",
  require("./routes/cmsRoutes")
);


// HOME ROUTE
app.get("/", (req, res) => {
  res.send("Hostelite Backend Running");
});


// GLOBAL ERROR HANDLER

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});



module.exports = app;

