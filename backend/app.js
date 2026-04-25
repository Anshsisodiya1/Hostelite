const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "https://hostelite-olive.vercel.app"],
    credentials: true,
  })
);

app.options("*", cors());

// Middleware
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/rooms", require("./routes/room.routes"));
app.use("/api/system-settings", require("./routes/systemSettings.routes"));
app.use("/api/meals", require("./routes/mealRoutes"));
app.use("/api/profile", require("./routes/userProfileRoutes"));
app.use("/api/floors", require("./routes/floorRoutes"));
// Test route
app.get("/", (req, res) => res.send("Hostelite Backend Running"));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error", error: err.message });
});

module.exports = app;