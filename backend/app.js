const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const cors = require("cors");

const cors = require("cors");

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://hostelite-olive.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/uploads", express.static("uploads"));


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
app.use("/api/meals", require("./routes/mealRoutes"));
app.use("/api/profile", require("./routes/userProfileRoutes"));






// Test
app.get("/", (req, res) => res.send("Hostelite Backend Running"));

module.exports = app;