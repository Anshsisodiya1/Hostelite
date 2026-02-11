import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/dashboard.css";
import {
  Users,
  UserCheck,
  Shield,
  TrendingUp,
  Search,
  Settings,
  FileText,
  CreditCard,
  AlertCircle,
  Utensils,
  Wrench,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // -------------------- ALL HOOKS AT THE TOP --------------------
  const [stats, setStats] = useState({
    students: 0,
    wardens: 0,
    total: 0,
    payments: 0,
    complaints: { pending: 0, resolved: 0 },
  });
  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState([]);

  // -------------------- FETCH DATA BASED ON ROLE --------------------
  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      fetchStats();
    } else if (user.role === "warden") {
      fetchComplaints();
    }
  }, [user]);

  // -------------------- FETCH FUNCTIONS --------------------
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
        payments: Math.floor(Math.random() * 50) + 10, // mock payments
        complaints: { pending: 0, resolved: 0 }, // handled separately
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    }
  };

  // -------------------- SEARCH --------------------
  const handleSearch = () => {
    if (!search.trim()) return;
    navigate(`/admin/users?search=${search}`);
  };

  const countResolvedToday = () => {
    const today = new Date();
    return complaints.filter((c) => {
      if (c.status !== "resolved") return false;
      const resolvedAt = new Date(c.updatedAt || c.resolvedAt);
      return (
        resolvedAt.getDate() === today.getDate() &&
        resolvedAt.getMonth() === today.getMonth() &&
        resolvedAt.getFullYear() === today.getFullYear()
      );
    }).length;
  };

  // -------------------- RENDER --------------------
  return (
    <div className="dashboard-container">
      {/* MODERN HEADER */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's what's happening in your hostel today</p>
          </div>
          <div className={`role-badge ${user?.role}`}>
            <Shield size={16} />
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </div>
        </div>
      </div>

      {/* ADMIN STATS */}
      {user?.role === "admin" && (
        <>
          <div className="admin-stats">
            <StatCard
              title="Total Users"
              value={stats.total}
              icon={<Users size={24} />}
              color="blue"
              trend="+15%"
            />
            <StatCard
              title="Students"
              value={stats.students}
              icon={<UserCheck size={24} />}
              color="green"
              trend="+12%"
            />
            <StatCard
              title="Wardens"
              value={stats.wardens}
              icon={<Shield size={24} />}
              color="orange"
              trend="+5%"
            />
            <StatCard
              title="Payments"
              value={stats.payments}
              icon={<CreditCard size={24} />}
              color="purple"
              trend="+18%"
            />
          </div>

          <div className="analytics-section">
            <h2>Quick Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <div className="analytics-header">
                  <TrendingUp size={20} className="trending-up" />
                  <span>User Growth</span>
                </div>
                <div className="analytics-value">+28%</div>
                <div className="analytics-subtitle">vs last month</div>
              </div>
              <div className="analytics-card">
                <div className="analytics-header">
                  <AlertCircle size={20} className="pending-icon" />
                  <span>Pending Complaints</span>
                </div>
                <div className="analytics-value">
                  {stats.complaints.pending}
                </div>
                <div className="analytics-subtitle">Need attention</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* WARDEN COMPLAINTS SUMMARY */}
      {user?.role === "warden" && (
        <div className="warden-summary">
          <div className="summary-cards">
            <div className="summary-card pending">
              <AlertTriangle size={24} />
              <div className="summary-content">
                <h3>Pending Complaints</h3>
                <div className="summary-value">
                  {complaints.filter((c) => c.status === "pending").length}
                </div>
              </div>
            </div>
            <div className="summary-card resolved">
              <CheckCircle size={24} />
              <div className="summary-content">
                <h3>Resolved Today</h3>
                <div className="summary-value">{countResolvedToday()}</div>
              </div>
            </div>
          </div>

          {complaints.length > 0 && (
            <div className="recent-complaints">
              <h3>Recent Complaints</h3>
              <div className="complaint-list">
                {complaints.slice(0, 5).map((complaint) => (
                  <div
                    key={complaint._id}
                    className={`complaint-item ${complaint.status}`}
                  >
                    <div className="complaint-priority">
                      {complaint.priority === "high" && (
                        <AlertCircle size={16} />
                      )}
                      {complaint.priority === "medium" && <Clock size={16} />}
                      {complaint.priority === "low" && (
                        <CheckCircle size={16} />
                      )}
                    </div>
                    <div className="complaint-content">
                      <p>{complaint.title || complaint.description}</p>
                      <span className={`status-badge ${complaint.status}`}>
                        {complaint.status}
                      </span>
                    </div>
                    {complaint.status === "pending" && (
                      <button
                        className="resolve-btn"
                        onClick={async () => {
                          try {
                            await API.put(`/complaints/${complaint._id}`, {
                              status: "resolved",
                            });
                            fetchComplaints();
                          } catch (err) {
                            console.error(
                              "Failed to update complaint:",
                              err.response?.data || err.message,
                            );
                            alert("Failed to update status");
                          }
                        }}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD CARDS */}
      <div className="dashboard-grid">
        {user?.role === "student" && (
          <>
            <DashboardCard
              title="Complaint Status"
              description="Track your hostel complaints"
              icon={<Wrench size={32} />}
              badge={`${complaints.filter((c) => c.status === "pending").length} Pending`}
              onClick={() => navigate("/complaints")}
            />
            <DashboardCard
              title="Fee Payment"
              description="Pay hostel fees online"
              icon={<CreditCard size={32} />}
              onClick={() => navigate("/payments")}
            />
            <DashboardCard
              title="Today's Meals"
              description="See today's meal plan"
              icon={<Utensils size={32} />}
              onClick={() => navigate("/student/meals")}
            />
          </>
        )}

        {user?.role === "warden" && (
          <>
            <DashboardCard
              title="Manage Complaints"
              description="Handle student complaints"
              icon={<AlertCircle size={32} />}
              badge={`${complaints.filter((c) => c.status === "pending").length} Pending`}
              onClick={() => navigate("/warden/complaints")}
            />
            <DashboardCard
              title="Meal Reports"
              description="Update daily meal plans"
              icon={<Utensils size={32} />}
              onClick={() => navigate("/warden/meals")}
            />
          </>
        )}

        {user?.role === "admin" && (
          <>
            <DashboardCard
              title="Manage Users"
              description="Edit roles & user data"
              icon={<Users size={32} />}
              onClick={() => navigate("/admin/users")}
            />
            <DashboardCard
              title="View Payments"
              description="Check hostel payments"
              icon={<CreditCard size={32} />}
              onClick={() => navigate("/admin/payments")}
            />

            <DashboardCard
              title="Hostel Reports"
              description="Generate system reports"
              icon={<FileText size={32} />}
              onClick={() => navigate("/admin/under-construction")}
            />

            <DashboardCard
              title="System Settings"
              description="Configure system preferences"
              icon={<Settings size={32} />}
              onClick={() => navigate("/admin/system-settings")}
            />
          </>
        )}
      </div>
    </div>
  );
}

// -------------------- COMPONENTS --------------------
function DashboardCard({ title, description, onClick, icon, badge }) {
  return (
    <div className="dashboard-card" onClick={onClick}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {badge && <div className="card-badge">{badge}</div>}
      <ChevronRight size={20} className="card-arrow" />
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h4>{title}</h4>
        <p className="stat-value">{value}</p>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
    </div>
  );
}
