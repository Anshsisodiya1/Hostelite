import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/dashboard.css";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase";

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

  const [complaints, setComplaints] = useState([]);
  const [profileStatus, setProfileStatus] = useState({
    loading: true,
    submitted: false,
  });

  // ================= FIREBASE =================
  useEffect(() => {
    if (!user) return;

    const messaging = getMessaging(app);
    const VAPID_KEY =
      "BGvkWr3pS-UBnhLSLAprlPSDRoP76mg7UDSeT2YjmL-3YoM1dp2lvSy0p4WtDs-Yn4cRvCDFD6kFsRsGG1tFsSc";

    Notification.requestPermission().then(async (permission) => {
      if (permission === "granted") {
        try {
          const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
          });

          if (token) {
            await API.post("/users/save-token", { token });
          }
        } catch (err) {
          console.error("Firebase token error:", err);
        }
      }
    });

    onMessage(messaging, (payload) => {
      alert(`${payload.notification?.title} - ${payload.notification?.body}`);
    });
  }, [user]);

  // ================= DATA LOAD =================
  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      fetchStats();
      fetchComplaints();
    } else if (user.role === "warden") {
      fetchComplaints();
    } else if (user.role === "student") {
      fetchProfileStatus();
      fetchComplaints();
    }
  }, [user]);

  const fetchProfileStatus = async () => {
    try {
      const res = await API.get("/profile/me");

      setProfileStatus({
        loading: false,
        submitted: res.data?.submitted || false,
      });
    } catch {
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

      setStats((prev) => ({
        ...prev,
        students: users.filter((u) => u.role === "student").length,
        wardens: users.filter((u) => u.role === "warden").length,
        total: users.length,
        payments: Math.floor(Math.random() * 50) + 10,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      const data = Array.isArray(res.data) ? res.data : [];

      setComplaints(data);

      setStats((prev) => ({
        ...prev,
        complaints: {
          pending: data.filter((c) => c.status === "pending").length,
          resolved: data.filter((c) => c.status === "resolved").length,
        },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DERIVED =================
  const studentPending = complaints.filter(
    (c) => c.status === "pending",
  ).length;

  const studentResolved = complaints.filter(
    (c) => c.status === "resolved",
  ).length;

  const countResolvedToday = () => {
    const today = new Date();

    return complaints.filter((c) => {
      if (c.status !== "resolved") return false;

      const date = new Date(c.updatedAt || c.createdAt);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Welcome back, {user.name}!</h1>
            <p>Hostel Dashboard</p>
          </div>

          <div className={`role-badge ${user.role}`}>
            <Shield size={16} />
            {user.role}
          </div>
        </div>
      </div>

      {/* ================= ADMIN ================= */}
      {/* ================= ADMIN ================= */}
      {user.role === "admin" && (
        <>
          {/* STATS */}
          <div className="admin-stats">
            <StatCard
              title="Total Users"
              value={stats.total}
              icon={<Users />}
            />
            <StatCard
              title="Students"
              value={stats.students}
              icon={<UserCheck />}
            />
            <StatCard title="Wardens" value={stats.wardens} icon={<Shield />} />
            <StatCard
              title="Payments"
              value={stats.payments}
              icon={<CreditCard />}
            />
          </div>

          {/* QUICK ANALYTICS (RESTORED) */}
          <div className="analytics-section">
            <h2>Quick Analytics</h2>

            <div className="analytics-grid">
              <div className="analytics-card">
                <TrendingUp size={20} />
                <span>User Growth</span>
                <div className="analytics-value">
                  +{Math.max(5, Math.floor(stats.total * 0.1))}%
                </div>
              </div>

              <div className="analytics-card">
                <AlertCircle size={20} />
                <span>Pending Complaints</span>
                <div className="analytics-value">
                  {stats.complaints.pending}
                </div>
              </div>

              <div className="analytics-card">
                <CheckCircle size={20} />
                <span>Resolved Complaints</span>
                <div className="analytics-value">
                  {stats.complaints.resolved}
                </div>
              </div>

              {/* <div className="analytics-card">
          <CreditCard size={20} />
          <span>Payment Status</span>
          <div className="analytics-value">
            {stats.payments}
          </div>
        </div> */}
            </div>
          </div>
        </>
      )}
      {/* ================= WARDEN ================= */}
      {user.role === "warden" && (
        <div className="warden-summary">
          <div className="summary-card">
            <AlertTriangle />
            <h3>Pending</h3>
            <p>{stats.complaints.pending}</p>
          </div>

          <div className="summary-card">
            <CheckCircle />
            <h3>Resolved Today</h3>
            <p>{countResolvedToday()}</p>
          </div>
        </div>
      )}

      {/* ================= CARDS ================= */}
      <div className="dashboard-grid">
        {/* STUDENT */}
        {user.role === "student" && (
          <>
            {/* ✅ PROFILE CARD (UPDATED BADGE ADDED HERE) */}
            <DashboardCard
              title={
                profileStatus.submitted
                  ? "Profile Submitted"
                  : "Complete Your Profile"
              }
              description="Manage your profile"
              icon={<UserCheck />}
              badge={profileStatus.submitted ? "Completed" : "Required"}
              onClick={() => navigate("/student/profile")}
            />

            <DashboardCard
              title="Complaints"
              description="Track complaints"
              icon={<Wrench />}
              badge={
                studentPending > 0
                  ? `${studentPending} Pending`
                  : studentResolved > 0
                    ? "Resolved"
                    : "No Complaints"
              }
              onClick={() => navigate("/complaints")}
            />

            <DashboardCard
              title="Fee Payment"
              description="Pay hostel fees"
              icon={<CreditCard />}
              onClick={() => navigate("/payments")}
            />

            <DashboardCard
              title="Today's Meals"
              description="Meal plan"
              icon={<Utensils />}
              onClick={() => navigate("/student/meals")}
            />
          </>
        )}

        {/* WARDEN */}
        {user.role === "warden" && (
          <>
            <DashboardCard
              title="Complaints"
              icon={<AlertCircle />}
              badge={`${stats.complaints.pending} Pending`}
              onClick={() => navigate("/warden/complaints")}
            />

            <DashboardCard
              title="Meal Management"
              icon={<Utensils />}
              onClick={() => navigate("/warden/meals")}
            />
          </>
        )}

        {/* ADMIN */}
        {user.role === "admin" && (
          <>
            <DashboardCard
              title="Manage-Users"
              icon={<Users />}
              onClick={() => navigate("/admin/users")}
            />
             <DashboardCard
              title="Payments"
              icon={<Users />}
              onClick={() => navigate("/admin/payments")}
            />
             <DashboardCard
              title="Reports"
              icon={<Users />}
              onClick={() => navigate("/admin/under-construction")}
            />
            <DashboardCard
              title="System Setings"
              icon={<Users />}
              onClick={() => navigate("/admin/system-settings")}
            />
            
          </>
        )}
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function DashboardCard({ title, description, icon, onClick, badge }) {
  return (
    <div className="dashboard-card" onClick={onClick}>
      <div className="card-icon">{icon}</div>

      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>

      {badge && <div className="card-badge">{badge}</div>}
      <ChevronRight className="card-arrow" />
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div>{icon}</div>
      <div>
        <h4>{title}</h4>
        <p>{value}</p>
      </div>
    </div>
  );
}
