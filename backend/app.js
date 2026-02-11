const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // allow frontend
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes")); // Admin users
// other routes...
app.use("/api/ratings", require("./routes/ratingRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/rooms", require("./routes/room.routes"));
app.use("/api/system-settings", require("./routes/systemSettings.routes"));
// app.use("/api/meals", require("./routes/mealRoutes"));





// Test
app.get("/", (req, res) => res.send("Hostelite Backend Running"));

module.exports = app;
