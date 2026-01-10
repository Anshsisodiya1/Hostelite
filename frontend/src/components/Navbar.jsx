import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">Hostelite</div>

      <ul className="nav-links">
        <li><Link to="/dashboard">Dashboard</Link></li>

        {user?.role === "student" && (
          <>
            <li><Link to="/complaints">Complaints</Link></li>
            <li><Link to="/payments">Pay Fees</Link></li>
          </>
        )}

        {user?.role === "warden" && (
          <li><Link to="/warden/complaints">View Complaints</Link></li>
        )}

        {user?.role === "admin" && (
          <>
            <li><Link to="/admin/users">Manage Users</Link></li>
            <li><Link to="/admin/payments">Payments</Link></li>
          </>
        )}
      </ul>

      {/* PROFILE ICON */}
      <div className="profile-container">
        <div
          className="profile-icon"
          onClick={() => setOpen(!open)}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {open && (
          <div className="profile-dropdown">
            <p><strong>Name: {user?.name}</strong></p>
            <p><strong>Email: </strong> {user?.email}</p>
            <p className="role"> <strong>Role:</strong> {user?.role?.toUpperCase()}</p>
            <hr />
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}