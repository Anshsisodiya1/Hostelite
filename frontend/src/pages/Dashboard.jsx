import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/dashboard.css";

// 🔥 FIREBASE IMPORTS
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase"; // make sure firebase.js exists

import {
  Users,
  UserCheck,
  Shield,
  TrendingUp,
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

  const [stats, setStats] = useState({
    students: 0,
    wardens: 0,
    total: 0,
    payments: 0,
    complaints: { pending: 0, resolved: 0 },
  });

  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [profileStatus, setProfileStatus] = useState({
    loading: true,
    submitted: false,
  });

  // ==============================
  // 🔔 FIREBASE NOTIFICATION SETUP
  // ==============================
  useEffect(() => {
    if (!user) return;

    const messaging = getMessaging(app);

    // 🔥 PUT YOUR VAPID KEY HERE
    const VAPID_KEY =
      "BGvkWr3pS-UBnhLSLAprlPSDRoP76mg7UDSeT2YjmL-3YoM1dp2lvSy0p4WtDs-Yn4cRvCDFD6kFsRsGG1tFsSc";

    // Request permission + get token
    Notification.requestPermission().then(async (permission) => {
      if (permission === "granted") {
        try {
          const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
          });

          if (token) {
            // Send token to backend
            await API.post("/users/save-token", { token });
          }
        } catch (err) {
          console.error("Token error:", err);
        }
      }
    });

    // Foreground notification
    onMessage(messaging, (payload) => {
      alert(payload.notification?.title + " - " + payload.notification?.body);
    });
  }, [user]);

  // ==============================
  // FETCH DATA BASED ON ROLE
  // ==============================
  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      fetchStats();
      fetchComplaints();
    } else if (user.role === "warden") {
      fetchComplaints();
    } else if (user.role === "student") {
      fetchProfileStatus();
      fetchComplaints(); // ✅ IMPORTANT
    }
  }, [user]);

  const fetchProfileStatus = async () => {
    try {
      const res = await API.get("/profile/me");
      setProfileStatus({
        loading: false,
        submitted: res.data?.submitted || false,
      });
    } catch (err) {
      setProfileStatus({
        loading: false,
        submitted: false,
      });
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/users");
      const users = Array.isArray(res.data) ? res.data : [];

      const students = users.filter((u) => u.role === "student").length;
      const wardens = users.filter((u) => u.role === "warden").length;

      setStats((prev) => ({
        ...prev,
        students,
        wardens,
        total: users.length,
        payments: Math.floor(Math.random() * 50) + 10,
      }));
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      const data = Array.isArray(res.data) ? res.data : [];

      setComplaints(data);

      const pending = data.filter((c) => c.status === "pending").length;
      const resolved = data.filter((c) => c.status === "resolved").length;

      setStats((prev) => ({
        ...prev,
        complaints: { pending, resolved },
      }));
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    }
  };

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

  // ==============================
  // ✅ STUDENT BADGE LOGIC (NEW)
  // ==============================
  const studentPending = complaints.filter(
    (c) => c.status === "pending",
  ).length;

  const studentResolved = complaints.filter(
    (c) => c.status === "resolved",
  ).length;

  const studentBadge =
    studentPending > 0
      ? `${studentPending} Pending`
      : studentResolved > 0
        ? "All Resolved"
        : "No Complaints";

  return (
    <div className="dashboard-container">
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

      {/* ================= ADMIN ================= */}
      {user?.role === "admin" && (
        <>
          <div className="admin-stats">
            <StatCard
              title="Total Users"
              value={stats.total}
              icon={<Users size={24} />}
              color="blue"
            />
            <StatCard
              title="Students"
              value={stats.students}
              icon={<UserCheck size={24} />}
              color="green"
            />
            <StatCard
              title="Wardens"
              value={stats.wardens}
              icon={<Shield size={24} />}
              color="orange"
            />
            <StatCard
              title="Payments"
              value={stats.payments}
              icon={<CreditCard size={24} />}
              color="purple"
            />
          </div>

          <div className="analytics-section">
            <h2>Quick Analytics</h2>
            <div className="analytics-grid">
              <div className="analytics-card">
                <TrendingUp size={20} />
                <span>User Growth</span>
                <div className="analytics-value">+28%</div>
              </div>

              <div className="analytics-card">
                <AlertCircle size={20} />
                <span>Pending Complaints</span>
                <div className="analytics-value">
                  {stats.complaints.pending}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= WARDEN ================= */}
      {user?.role === "warden" && (
        <div className="warden-summary">
          <div className="summary-cards">
            <div className="summary-card pending">
              <AlertTriangle size={24} />
              <h3>Pending</h3>
              <div>
                {complaints.filter((c) => c.status === "pending").length}
              </div>
            </div>

            <div className="summary-card resolved">
              <CheckCircle size={24} />
              <h3>Resolved Today</h3>
              <div>{countResolvedToday()}</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DASHBOARD CARDS ================= */}
      <div className="dashboard-grid">
        {user?.role === "student" && (
          <>
            {/* ✅ PROFILE CARD (RESTORED) */}
            <DashboardCard
              title={
                profileStatus.submitted
                  ? "Profile Submitted"
                  : "Complete Your Profile"
              }
              description={
                profileStatus.submitted
                  ? "View your submitted personal details"
                  : "Submit your personal details (One-time only)"
              }
              icon={<UserCheck size={32} />}
              badge={profileStatus.submitted ? "Completed" : "Required"}
              onClick={() => navigate("/student/profile")}
            />

            {/* ✅ COMPLAINT CARD (UPDATED BADGE LOGIC) */}
            <DashboardCard
              title="Complaint Status"
              description="Track your hostel complaints"
              icon={<Wrench size={32} />}
              badge={
                complaints.filter((c) => c.status === "pending").length > 0
                  ? `${complaints.filter((c) => c.status === "pending").length} Pending`
                  : complaints.filter((c) => c.status === "resolved").length > 0
                    ? "All Resolved"
                    : "No Complaints"
              }
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
              description="Update meals"
              icon={<Utensils size={32} />}
              onClick={() => navigate("/warden/meals")}
            />
          </>
        )}

        {user?.role === "admin" && (
          <>
            <DashboardCard
              title="Manage Users"
              icon={<Users size={32} />}
              onClick={() => navigate("/admin/users")}
            />
            <DashboardCard
              title="Payments"
              icon={<CreditCard size={32} />}
              onClick={() => navigate("/admin/payments")}
            />
            <DashboardCard title="Reports" icon={<FileText size={32} />} />
            <DashboardCard title="Settings" icon={<Settings size={32} />} />
          </>
        )}
      </div>
    </div>
  );
}

// ================= COMPONENTS =================
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

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
    </div>
  );
}
