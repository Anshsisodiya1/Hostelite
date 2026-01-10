import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0,
    wardens: 0,
    total: 0,
  });

  const [search, setSearch] = useState("");

  // ADMIN: Fetch user stats
  useEffect(() => {
    if (user?.role === "admin") {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await API.get("/users");
      const users = Array.isArray(res.data) ? res.data : [];

      const students = users.filter((u) => u.role === "student").length;
      const wardens = users.filter((u) => u.role === "warden").length;

      setStats({
        students,
        wardens,
        total: users.length,
      });
    } catch (err) {
      console.error("Failed to fetch stats");
    }
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    navigate(`/admin/users?search=${search}`);
  };

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>
          Welcome, <strong>{user?.name}</strong>
        </p>
        <span className="role-badge">{user?.role?.toUpperCase()}</span>
      </div>

      {/* ================= ADMIN STATS ================= */}
      {user?.role === "admin" && (
        <>
          <div className="admin-stats">
            <StatCard title="Total Users" value={stats.total} />
            <StatCard title="Students" value={stats.students} />
            <StatCard title="Wardens" value={stats.wardens} />
          </div>

        </>
      )}

      {/* ================= DASHBOARD CARDS ================= */}
      <div className="dashboard-grid">

        {/* STUDENT */}
        {user?.role === "student" && (
          <>
            <DashboardCard
              title="Submit Complaint"
              description="Raise hostel related issues"
              onClick={() => navigate("/complaints")}
            />
            <DashboardCard
              title="Meal Rating"
              description="Rate today's food quality"
              onClick={() => navigate("/ratings")}
            />
            <DashboardCard
              title="Hostel Fees"
              description="Pay hostel fees online"
              onClick={() => navigate("/payments")}
            />
          </>
        )}

        {/* WARDEN */}
        {user?.role === "warden" && (
          <DashboardCard
            title="View Complaints"
            description="Manage student complaints"
            onClick={() => navigate("/warden/complaints")}
          />
        )}

        {/* ADMIN */}
        {user?.role === "admin" && (
          <>
            <DashboardCard
              title="Manage Users"
              description="Edit roles & user data"
              onClick={() => navigate("/admin/users")}
            />
            <DashboardCard
              title="View Payments"
              description="Check hostel payments"
              onClick={() => navigate("/admin/payments")}
            />
          </>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function DashboardCard({ title, description, onClick }) {
  return (
    <div className="dashboard-card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  );
}