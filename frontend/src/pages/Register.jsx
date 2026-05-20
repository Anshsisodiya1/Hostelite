import { useState } from "react";
import API from "../services/api";
import "../styles/Register.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      return setError("All fields are required");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!form.agree) {
      return setError("Please accept terms");
    }

    try {
      setLoading(true);
      await API.post("/auth/register", form);
      alert("User created successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        {/* Header */}
        <h2 className="title">User Registration</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* NAME + EMAIL */}
          <div className="row">
            <div className="field">
              <label>Full Name</label>
              <input
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                name="email"
                placeholder="Enter email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* PASSWORD + CONFIRM PASSWORD */}
          <div className="row">
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ROLE FULL WIDTH */}
          <div className="field">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="warden">Warden</option>
              {/* <option value="admin">Admin</option> */}
            </select>
          </div>

          {/* TERMS (FIXED ALIGNMENT) */}
          <div className="terms">
            <input
              type="checkbox"
              name="agree"
              checked={form.agree}
              onChange={handleChange}
            />
            <span>I agree to Terms & Policies</span>
          </div>

          {/* BUTTON */}
          <button disabled={loading} className="btn">
            {loading ? "Creating..." : "REGISTER"}
          </button>
        </form>
      </div>
    </div>
  );
}
