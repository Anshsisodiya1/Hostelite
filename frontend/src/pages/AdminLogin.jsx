import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [require2FA, setRequire2FA] = useState(false);
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const emailRef = useRef(null);
  const otpRefs = useRef([]);

  useEffect(() => {
    const saved = localStorage.getItem("adminRememberedEmail");

    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }

    emailRef.current?.focus();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /* ================= OTP ================= */

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const next = [...otp];
    next[index] = value.slice(-1);

    setOtp(next);
    setError("");

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }

    e.preventDefault();
  };

  /* ================= ADMIN LOGIN ================= */

  const loginHandler = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      // Pass portal: "admin" so backend enforces admin-only server-side
      const res = await API.post("/auth/login", {
        email,
        password,
        portal: "admin",
      });

      if (res.data.require2FA) {
        setRequire2FA(true);
        setUserId(res.data.userId);
        return;
      }

      if (res.data.token && res.data.user) {
        rememberMe
          ? localStorage.setItem("adminRememberedEmail", email)
          : localStorage.removeItem("adminRememberedEmail");

        login(res.data.token, res.data.user);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      // Backend returns 403 when a non-admin tries the admin portal
      if (err.response?.status === 403) {
        setError("Only administrators can login from this portal.");
      } else {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY 2FA ================= */

  const verify2FAHandler = async () => {
    const otpString = otp.join("");

    if (otpString.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }

    setLoading(true);

    try {
      // Pass portal: "admin" here too
      const res = await API.post("/auth/verify-2fa-login", {
        userId,
        token: otpString,
        portal: "admin",
      });

      login(res.data.token, res.data.user);
      navigate("/admin/dashboard");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Only administrators can login from this portal.");
      } else {
        setError("Invalid code. Please try again.");
      }

      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  /* ================= 2FA SCREEN ================= */

  if (require2FA) {
    return (
      <div className="login-page">
        <div className="login-container">
          <h1 className="login-title">Admin Verification</h1>

          <p className="login-subtitle">
            Enter the 6-digit code from your authenticator app
          </p>

          {error && (
            <div className="error-box">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div className="otp-wrapper" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="otp-input"
                autoFocus={i === 0}
              />
            ))}
          </div>

          <button
            className="login-btn"
            onClick={verify2FAHandler}
            disabled={loading || otp.join("").length < 6}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Verifying...
              </>
            ) : (
              <>Confirm & Sign In</>
            )}
          </button>
        </div>
      </div>
    );
  }

  /* ================= LOGIN SCREEN ================= */

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Admin Portal</h1>

        <p className="login-subtitle">
          Sign in to access the Hostelite Administration Dashboard
        </p>

        {error && (
          <div className="error-box">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={loginHandler} className="login-form" noValidate>
          <div className="form-group">
            <label>Email</label>

            <div className="input-box">
              <Mail size={18} className="left-icon" />

              <input
                ref={emailRef}
                type="email"
                placeholder="admin@hostelite.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="input-box">
              <Lock size={18} className="left-icon-l" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="right-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <label className="remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Keep me signed in
          </label>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}