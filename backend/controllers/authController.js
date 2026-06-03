const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");


// REGISTER

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ADMIN LIMIT
    if (role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount >= 1) {
        return res.status(403).json({
          message: "Admin already exists",
        });
      }
    }

    // WARDEN LIMIT
    if (role === "warden") {
      const wardenCount = await User.countDocuments({ role: "warden" });
      if (wardenCount >= 2) {
        return res.status(403).json({
          message: "Maximum wardens reached",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Register failed" });
  }
};


//  HELPER — populated user fetch (reused in login + 2FA login)

const getPopulatedUser = (userId) =>
  User.findById(userId)
    .populate({
      path: "room",
      populate: { path: "floor" }, // nested: student ke liye room.floor
    })
    .populate("floor", "floorNumber") // warden ke liye direct floor
    .select("-password");


// LOGIN (with portal-based role enforcement)
//
// The frontend sends a "portal" field:
//   portal: "admin" → only role === "admin" is allowed
//   portal: "user"  → only role === "student" or "warden" is allowed

const loginUser = async (req, res) => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // PORTAL ROLE ENFORCEMENT
    if (portal === "admin" && user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can login from this portal.",
      });
    }

    if (portal === "user" && user.role === "admin") {
      return res.status(403).json({
        message: "Administrators must login through the Admin Portal.",
      });
    }

    // 2FA CHECK
    if (user.twoFactorEnabled) {
      return res.json({
        require2FA: true,
        userId: user._id,
      });
    }

    // NORMAL LOGIN
    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    //  FIX: populated user return  (floor + room included)
    const populatedUser = await getPopulatedUser(user._id);

    res.json({
      token,
      user: populatedUser,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};


// GENERATE 2FA (QR)

const generate2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const secret = speakeasy.generateSecret({
      name: "Hostelite Admin",
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      qrCode,
      message: "Scan QR in Authenticator App",
    });
  } catch (error) {
    console.error("2FA GENERATE ERROR:", error);
    res.status(500).json({ message: "Failed to generate 2FA" });
  }
};


// VERIFY 2FA SETUP

const verify2FASetup = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findById(req.user.id);

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: "2FA enabled successfully" });
  } catch (error) {
    console.error("2FA SETUP ERROR:", error);
    res.status(500).json({ message: "2FA setup failed" });
  }
};


// VERIFY 2FA LOGIN (with portal-based role enforcement)

const verify2FALogin = async (req, res) => {
  try {
    const { userId, token, portal } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // PORTAL ROLE ENFORCEMENT
    if (portal === "admin" && user.role !== "admin") {
      return res.status(403).json({
        message: "Only administrators can login from this portal.",
      });
    }

    if (portal === "user" && user.role === "admin") {
      return res.status(403).json({
        message: "Administrators must login through the Admin Portal.",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const jwtToken = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // FIX: populated user return karo (floor + room included)
    const populatedUser = await getPopulatedUser(user._id);

    res.json({
      token: jwtToken,
      user: populatedUser,
    });
  } catch (error) {
    console.error("2FA LOGIN ERROR:", error);
    res.status(500).json({ message: "2FA login failed" });
  }
};


// FORGOT PASSWORD

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset OTP",
      html: `<h2>Your OTP is ${otp}</h2>`,
    });

    res.json({ message: "OTP sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


// RESET PASSWORD

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Reset failed" });
  }
};


// EXPORT ALL

module.exports = {
  registerUser,
  loginUser,
  generate2FA,
  verify2FASetup,
  verify2FALogin,
  forgotPassword,
  resetPassword,
};