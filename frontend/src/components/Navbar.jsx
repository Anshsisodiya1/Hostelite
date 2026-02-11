import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../services/api";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Store user in state to trigger re-render when updated
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );

  // Fetch latest user profile if student
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.role === "student") {
        try {
          const res = await API.get("/users/me");
          setUser(res.data); // update state
          localStorage.setItem("user", JSON.stringify(res.data)); // update localStorage
        } catch (err) {
          console.log("Failed to fetch user profile:", err);
        }
      }
    };
    fetchProfile();
  }, [user?.role]);

  // Listen to localStorage changes (e.g., room number update)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));
      setUser(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">Hostelite</div>

      <ul className="nav-links">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>

        {user?.role === "student" && (
          <>
            <li>
              <Link to="/complaints">Complaints</Link>
            </li>
            <li>
              <Link to="/payments">Pay Fees</Link>
            </li>
          </>
        )}

        {user?.role === "warden" && (
          <li>
            <Link to="/warden/complaints">View Complaints</Link>
          </li>
        )}

        {user?.role === "admin" && (
          <>
            <li>
              <Link to="/admin/users">Manage Users</Link>
            </li>
            <li>
              <Link to="/admin/payments">Payments</Link>
            </li>
          </>
        )}
      </ul>

      {/* PROFILE ICON */}
      <div className="profile-container">
        <div className="profile-icon" onClick={() => setOpen(!open)}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        {open && (
          <div className="profile-dropdown">
            <p>
              <strong>Name: {user?.name}</strong>
            </p>
            <p>
              <strong>Email: </strong> {user?.email}
            </p>
            <p className="role">
              <strong>Role:</strong> {user?.role?.toUpperCase()}
            </p>
            {user?.role === "student" && (
              <p>
                <strong>Room No:</strong>{" "}
                {user?.room?.roomNumber || "Not Assigned"}
              </p>
            )}

            <hr />
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
