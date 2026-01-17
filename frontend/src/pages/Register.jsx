import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "../styles/Login.css"; 

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);

  useEffect(() => {
    // Auto-focus name input
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }

    // Track mouse position for interactive effects
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthColor = () => {
    const strength = calculatePasswordStrength(password);
    if (strength === 0) return '#e2e8f0';
    if (strength === 1) return '#ef4444';
    if (strength === 2) return '#f59e0b';
    if (strength === 3) return '#3b82f6';
    return '#10b981';
  };

  const getPasswordStrengthText = () => {
    const strength = calculatePasswordStrength(password);
    if (strength === 0) return '';
    if (strength === 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Good';
    return 'Strong';
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError("");
    
    try {
      // For demo purposes, simulate social login
      // In production, this would redirect to OAuth provider
      if (provider === 'google') {
        // Simulate Google OAuth flow
        const googleAuthUrl = `${API.defaults.baseURL || 'http://localhost:5000'}/auth/google`;
        window.location.href = googleAuthUrl;
      } else if (provider === 'microsoft') {
        // Simulate Microsoft OAuth flow
        const microsoftAuthUrl = `${API.defaults.baseURL || 'http://localhost:5000'}/auth/microsoft`;
        window.location.href = microsoftAuthUrl;
      }
    } catch (error) {
      console.error('Social login error:', error);
      setError(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login failed. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const registerHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (name.length < 2) {
      setError("Name must be at least 2 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/register", { name, email, password, role });

      // Show success animation
      setShowSuccess(true);
      
      setTimeout(() => {
        alert("Registration successful!");
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.status === 409) {
        setError("Email already exists");
      } else if (error.response?.status === 429) {
        setError("Too many registration attempts. Please try again later");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR') {
        setError("Network error. Please check your connection");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
    
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'role':
        setRole(value);
        break;
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
      {/* Animated background elements */}
      <div className="floating-elements">
        <div className="floating-element element-1" style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)` }}></div>
        <div className="floating-element element-2" style={{ transform: `translate(${-mousePosition.x * 0.008}px, ${-mousePosition.y * 0.008}px)` }}></div>
        <div className="floating-element element-3" style={{ transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)` }}></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">
              <span className="logo-text">👤</span>
              <div className="logo-glow"></div>
            </div>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Join Hostelite and manage your hostel life</p>
          </div>
        </div>

        {showSuccess && (
          <div className="success-message">
            <div className="success-icon">✨</div>
            <div className="success-text">Registration successful! Redirecting...</div>
            <div className="success-progress"></div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={registerHandler} className="auth-form">
          <div className="input-group">
            <div className={`input-wrapper ${isFocused === 'name' ? 'focused' : ''}`}>
              <span className="input-icon">👤</span>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onFocus={() => handleInputFocus('name')}
                onBlur={handleInputBlur}
                required
                className="auth-input"
              />
              <div className="input-border"></div>
            </div>
          </div>

          <div className="input-group">
            <div className={`input-wrapper ${isFocused === 'email' ? 'focused' : ''}`}>
              <span className="input-icon">📧</span>
              <input
                ref={emailInputRef}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={() => handleInputFocus('email')}
                onBlur={handleInputBlur}
                required
                className="auth-input"
              />
              <div className="input-border"></div>
            </div>
          </div>

          <div className="input-group">
            <div className={`input-wrapper ${isFocused === 'password' ? 'focused' : ''}`}>
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onFocus={() => handleInputFocus('password')}
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
            
            {/* Password strength indicator */}
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(calculatePasswordStrength(password) / 4) * 100}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  />
                </div>
                <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}
          </div>

          <div className="input-group">
            <div className={`input-wrapper ${isFocused === 'confirmPassword' ? 'focused' : ''}`}>
              <span className="input-icon">🔒</span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onFocus={() => handleInputFocus('confirmPassword')}
                onBlur={handleInputBlur}
                required
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
              <div className="input-border"></div>
            </div>
          </div>

          <div className="input-group">
            <div className={`input-wrapper ${isFocused === 'role' ? 'focused' : ''}`}>
              <span className="input-icon">👀</span>
              <select
                value={role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                onFocus={() => handleInputFocus('role')}
                onBlur={handleInputBlur}
                required
                className="auth-input"
              >
                <option value="student">👨‍🎓 Student</option>
                <option value="warden">🏥 Warden</option>
                <option value="admin">👨‍💼 Admin</option>
              </select>
              <div className="input-border"></div>
            </div>
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={loading}
              />
              <span className="checkbox-custom"></span>
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              <>
                <span className="button-text">Create Account</span>
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <span onClick={() => navigate("/login")} style={{color:"#007bff", cursor:"pointer"}}>Log-in</span>
        </p>

      </div>
    </div>
  );
}