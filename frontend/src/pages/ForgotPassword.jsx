import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/ForgotPassword.css";

// ── Icons (inline SVG — no extra dependency needed) ──────────────────────────
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

const getPasswordStrength = (password) => {
  if (!password) return null;
  if (password.length < 6) return "weak";
  if (
    password.match(/[A-Z]/) &&
    password.match(/[0-9]/) &&
    password.match(/[@$!%*?&]/)
  ) return "strong";
  return "medium";
};

const strengthLabel = { weak: "Weak", medium: "Medium", strong: "Strong" };

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    const tempErrors = {};
    if (newPassword.length < 6)
      tempErrors.newPassword = "Password must be at least 6 characters";
    if (newPassword !== confirmPassword)
      tempErrors.confirmPassword = "Passwords do not match";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.post("/auth/forgot-password", { email });
      alert("OTP sent successfully");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      setLoading(true);
      await API.post("/auth/reset-password", { email, otp, newPassword });
      alert("Password updated successfully");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="fp-container">
      <div className="fp-card">

        {/* Icon */}
        <div className="fp-icon-wrap">
          <LockIcon />
        </div>

        {/* Title */}
        <h2 className="fp-title">Forgot Password</h2>
        <p className="fp-subtitle">
          {step === 1
            ? "Enter your registered email to receive a one-time password."
            : "Check your inbox for the OTP and set a new password."}
        </p>

        {/* Step Indicator */}
        <div className="fp-steps">
          <div className={`fp-step ${step >= 1 ? (step > 1 ? "done" : "active") : ""}`}>
            <div className="fp-step-dot">{step > 1 ? "✓" : "1"}</div>
            <span className="fp-step-label">Email</span>
          </div>
          <div className={`fp-step-line ${step > 1 ? "done" : ""}`} />
          <div className={`fp-step ${step === 2 ? "active" : ""}`}>
            <div className="fp-step-dot">2</div>
            <span className="fp-step-label">Reset</span>
          </div>
        </div>

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <form className="fp-form" onSubmit={handleSendOtp}>
            <div className="fp-field">
              <label className="fp-label">Email Address</label>
              <input
                className="fp-input"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button className={`fp-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP + New Password ── */}
        {step === 2 && (
          <form className="fp-form" onSubmit={handleResetPassword}>
            {/* OTP */}
            <div className="fp-field">
              <label className="fp-label">One-Time Password</label>
              <input
                className="fp-input"
                type="text"
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <span className="fp-otp-hint">Sent to {email}</span>
            </div>

            {/* New Password */}
            <div className="fp-field">
              <label className="fp-label">New Password</label>
              <div className="fp-password-wrap">
                <input
                  className={`fp-input ${errors.newPassword ? "has-error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="fp-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Strength Bar */}
              {newPassword && strength && (
                <div className="fp-strength-wrap">
                  <div className="fp-strength-bar-track">
                    <div className={`fp-strength-bar-fill ${strength}`} />
                  </div>
                  <span className={`fp-strength-label ${strength}`}>
                    Strength: {strengthLabel[strength]}
                  </span>
                </div>
              )}

              {errors.newPassword && (
                <span className="fp-error">{errors.newPassword}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="fp-field">
              <label className="fp-label">Confirm Password</label>
              <div className="fp-password-wrap">
                <input
                  className={`fp-input ${errors.confirmPassword ? "has-error" : ""}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && (
                <span className="fp-error">{errors.confirmPassword}</span>
              )}
            </div>

            <button className={`fp-btn ${loading ? "loading" : ""}`} disabled={loading}>
              {loading ? "Updating…" : "Reset Password"}
            </button>
          </form>
        )}

        <div className="fp-divider" />

        {/* Back to Login */}
        <div className="fp-back" onClick={() => navigate("/login")}>
          <ArrowLeftIcon />
          Back to Login
        </div>

      </div>
    </div>
  );
}