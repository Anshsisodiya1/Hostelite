const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication Middleware

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    req.user = user; // Attach full user object
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized access",
      error: error.message,
    });
  }
};

// Admin Authorization Middleware

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }
  next();
};

// Role-Based Authorization Middleware

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied.",
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  isAdmin,
  authorizeRoles,
}; 