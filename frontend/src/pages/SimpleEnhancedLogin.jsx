// import { useState, useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import API from "../services/api";
// import { useAuth } from "../contexts/AuthContext";
// import "../styles/SimpleEnhancedLogin.css";

// export default function SimpleEnhancedLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [error, setError] = useState("");

//   const navigate = useNavigate();
//   const { login } = useAuth();

//   useEffect(() => {
//     const savedEmail = localStorage.getItem('rememberedEmail');
//     if (savedEmail) {
//       setEmail(savedEmail);
//       setRememberMe(true);
//     }
//   }, []);

//   const validateEmail = (email) => {
//     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return re.test(email);
//   };

//   const loginHandler = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!email || !password) {
//       setError("Please fill in all fields");
//       return;
//     }

//     if (!validateEmail(email)) {
//       setError("Please enter a valid email");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await API.post("/auth/login", { email, password });

//       if (rememberMe) {
//         localStorage.setItem('rememberedEmail', email);
//       } else {
//         localStorage.removeItem('rememberedEmail');
//       }

//       login(res.data.token, res.data.user);
//       navigate("/dashboard");
//     } catch (error) {
//       setError(error.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="simple-auth-container">
//       <div className="auth-card">
//         <div className="auth-header">
//           <div className="auth-logo">
//             <div className="logo-icon">🏠</div>
//             <h2>Welcome Back</h2>
//             <p>Sign in to your Hostelite account</p>
//           </div>
//         </div>

//         {error && (
//           <div className="error-message">
//             <span className="error-icon">⚠️</span>
//             {error}
//           </div>
//         )}

//         <form onSubmit={loginHandler} className="auth-form">
//           <div className="input-group">
//             <label>Email Address</label>
//             <div className="input-wrapper">
//               <span className="input-icon">📧</span>
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="auth-input"
//                 autoFocus
//               />
//             </div>
//           </div>

//           <div className="input-group">
//             <label>Password</label>
//             <div className="input-wrapper">
//               <span className="input-icon">🔒</span>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="auth-input"
//               />
//               <button
//                 type="button"
//                 className="password-toggle"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? "👁️" : "👁️‍🗨️"}
//               </button>
//             </div>
//           </div>

//           <div className="form-options">
//             <label className="checkbox-label">
//               <input
//                 type="checkbox"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//               />
//               <span className="checkbox-custom"></span>
//               Remember me
//             </label>
//             <Link to="/forgot-password" className="forgot-link">
//               Forgot password?
//             </Link>
//           </div>

//           <button type="submit" disabled={loading} className="login-button">
//             {loading ? (
//               <>
//                 <span className="spinner"></span>
//                 Signing in...
//               </>
//             ) : (
//               "Sign In"
//             )}
//           </button>
//         </form>

//         <div className="divider">
//           <span>OR</span>
//         </div>

//         <div className="social-login">
//           <button className="social-btn google">
//             <span className="social-icon">🌐</span>
//             Continue with Google
//           </button>
//           <button className="social-btn microsoft">
//             <span className="social-icon">🪟</span>
//             Continue with Microsoft
//           </button>
//         </div>

//         <div className="auth-footer">
//           <p>
//             Don't have an account? <Link to="/register">Sign up</Link>
//           </p>
//           <p className="security-text">
//             🔒 Your data is secure and encrypted
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
