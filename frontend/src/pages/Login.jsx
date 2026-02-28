import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isFocused, setIsFocused] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();
  const emailInputRef = useRef(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });

      if (res.data.token && res.data.user) {
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Direct login and navigate
        login(res.data.token, res.data.user);
        navigate("/dashboard");
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setError("Invalid email or password");
      } else if (error.response?.status === 429) {
        setError("Too many login attempts. Please try again later");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === "NETWORK_ERROR") {
        setError("Network error. Please check your connection");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (error) setError("");

    if (field === "email") {
      setEmail(value);
    } else if (field === "password") {
      setPassword(value);
    }
  };

  const handleInputFocus = (field) => {
    setIsFocused(field);
  };

  const handleInputBlur = () => {
    setIsFocused("");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">
              <span className="logo-text">🏠</span>
              <div className="logo-glow"></div>
            </div>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">
              Sign in to your Hostelite account
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={loginHandler} className="auth-form">
          <div className="input-group">
            <div
              className={`input-wrapper ${
                isFocused === "email" ? "focused" : ""
              }`}
            >
              <input
                ref={emailInputRef}
                type="email"
                placeholder="Enter your E-mail"
                value={email}
                onChange={(e) =>
                  handleInputChange("email", e.target.value)
                }
                onFocus={() => handleInputFocus("email")}
                onBlur={handleInputBlur}
                required
                className="auth-input"
              />
              <div className="input-border"></div>
            </div>
          </div>

          <div className="input-group">
            <div
              className={`input-wrapper ${
                isFocused === "password" ? "focused" : ""
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  handleInputChange("password", e.target.value)
                }
                onFocus={() => handleInputFocus("password")}
                onBlur={handleInputBlur}
                required
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
              <div className="input-border"></div>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(e.target.checked)
                }
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <span className="button-text">Sign In</span>
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <p
          className="forgot-password"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
} 