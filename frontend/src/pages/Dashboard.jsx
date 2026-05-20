import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/dashboard.css";

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase";

import {
  Users, UserCheck, Shield, TrendingUp, CreditCard,
  AlertCircle, Utensils, Wrench, ChevronRight,
  CheckCircle, AlertTriangle, ArrowUpRight, Activity,
  Home, BookOpen, Clock, BarChart3, Settings,
} from "lucide-react";

/* ─── time greeting ─── */
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    students: 0, wardens: 0, total: 0, payments: 0,
    complaints: { pending: 0, resolved: 0 },
  });
  const [complaints, setComplaints] = useState([]);
  const [profileStatus, setProfileStatus] = useState({ loading: true, submitted: false });

  /* ── Firebase ── */
  useEffect(() => {
    if (!user) return;
    const messaging = getMessaging(app);
    const VAPID_KEY = "BGvkWr3pS-UBnhLSLAprlPSDRoP76mg7UDSeT2YjmL-3YoM1dp2lvSy0p4WtDs-Yn4cRvCDFD6kFsRsGG1tFsSc";
    Notification.requestPermission().then(async (p) => {
      if (p === "granted") {
        try {
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) await API.post("/users/save-token", { token });
        } catch (e) { console.error(e); }
      }
    });
    onMessage(messaging, (payload) =>
      alert(`${payload.notification?.title} - ${payload.notification?.body}`)
    );
  }, [user]);

  /* ── Data ── */
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin")   { fetchStats(); fetchComplaints(); }
    if (user.role === "warden")  { fetchComplaints(); }
    if (user.role === "student") { fetchProfileStatus(); fetchComplaints(); }
  }, [user]);

  const fetchProfileStatus = async () => {
    try {
      const res = await API.get("/profile/me");
      setProfileStatus({ loading: false, submitted: res.data?.submitted || false });
    } catch { setProfileStatus({ loading: false, submitted: false }); }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/users");
      const u = Array.isArray(res.data) ? res.data : [];
      setStats(p => ({
        ...p,
        students: u.filter(x => x.role === "student").length,
        wardens:  u.filter(x => x.role === "warden").length,
        total: u.length,
        payments: Math.floor(Math.random() * 50) + 10,
      }));
    } catch (e) { console.error(e); }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      const data = Array.isArray(res.data) ? res.data : [];
      setComplaints(data);
      setStats(p => ({
        ...p,
        complaints: {
          pending:  data.filter(c => c.status === "pending").length,
          resolved: data.filter(c => c.status === "resolved").length,
        },
      }));
    } catch (e) { console.error(e); }
  };

  const countResolvedToday = () => {
    const t = new Date();
    return complaints.filter(c => {
      if (c.status !== "resolved") return false;
      const d = new Date(c.updatedAt || c.createdAt);
      return d.getDate()===t.getDate() && d.getMonth()===t.getMonth() && d.getFullYear()===t.getFullYear();
    }).length;
  };

  const studentPending  = complaints.filter(c => c.status === "pending").length;
  const studentResolved = complaints.filter(c => c.status === "resolved").length;

  if (!user) return null;

  /* ════════════════════════════════════════════════
     ADMIN DASHBOARD
  ════════════════════════════════════════════════ */
  if (user.role === "admin") {
    return (
      <div className="dash dash--admin">
        <main className="dash__main">

          {/* Hero */}
          <section className="admin-hero">
            <div className="admin-hero__text">
              <p className="overline">{greeting()}, Administrator</p>
              <h1>{user.name}</h1>
              <p className="subtitle">Here's what's happening across your hostel today.</p>
            </div>
            <div className="admin-hero__badge">
              <Shield size={13} /> Admin
            </div>
          </section>

          {/* KPI strip */}
          <section className="kpi-grid kpi-grid--4">
            <KpiCard label="Total Users"   value={stats.total}               icon={<Users size={20}/>}       accent="blue"   sub={`↑${Math.max(5, Math.floor(stats.total*0.1))}% this month`} />
            <KpiCard label="Students"      value={stats.students}            icon={<UserCheck size={20}/>}   accent="emerald" sub="Active residents" />
            <KpiCard label="Wardens"       value={stats.wardens}             icon={<Shield size={20}/>}      accent="violet" sub="On duty" />
            <KpiCard label="Pending Issues" value={stats.complaints.pending} icon={<AlertCircle size={20}/>} accent="amber"  sub={`${stats.complaints.resolved} resolved`} />
          </section>

          {/* Analytics row */}
          <section className="analytics-row">
            <div className="analytics-panel">
              <div className="panel-head">
                <BarChart3 size={16} />
                <h2>Quick Analytics</h2>
              </div>
              <div className="analytics-tiles">
                <AnalyticTile icon={<TrendingUp size={18}/>} label="User Growth"          value={`+${Math.max(5, Math.floor(stats.total*0.1))}%`} color="blue" />
                <AnalyticTile icon={<AlertCircle size={18}/>} label="Pending Complaints"  value={stats.complaints.pending}  color="amber" />
                <AnalyticTile icon={<CheckCircle size={18}/>} label="Resolved Complaints" value={stats.complaints.resolved} color="emerald" />
              </div>
            </div>

            <div className="activity-panel">
              <div className="panel-head">
                <Activity size={16} />
                <h2>Complaint Overview</h2>
              </div>
              <div className="status-list">
                <StatusRow label="Total Complaints"    value={stats.complaints.pending + stats.complaints.resolved} dot="blue" />
                <StatusRow label="Pending"             value={stats.complaints.pending}  dot={stats.complaints.pending > 0 ? "amber" : "green"} />
                <StatusRow label="Resolved"            value={stats.complaints.resolved} dot="green" />
                <StatusRow label="Resolution Rate"     value={stats.complaints.pending + stats.complaints.resolved > 0 ? `${Math.round((stats.complaints.resolved / (stats.complaints.pending + stats.complaints.resolved)) * 100)}%` : "N/A"} dot="green" />
              </div>
            </div>
          </section>

          {/* Action cards */}
          <section className="section">
            <h2 className="section__title">Quick Actions</h2>
            <div className="action-grid action-grid--4">
              <ActionCard icon={<Users size={22}/>}    title="Manage Users"    desc="Add, edit and manage accounts"       accent="blue"   onClick={() => navigate("/admin/users")} />
              <ActionCard icon={<CreditCard size={22}/>} title="Payments"      desc="Track fees, dues and receipts"       accent="emerald" onClick={() => navigate("/admin/payments")} />
              <ActionCard icon={<BarChart3 size={22}/>}  title="Reports"       desc="Occupancy & financial reports"       accent="violet" onClick={() => navigate("/admin/report")} />
              <ActionCard icon={<Settings size={22}/>}   title="System Settings" desc="Rooms, floors & configuration"    accent="slate"  onClick={() => navigate("/admin/system-settings")} />
            </div>
          </section>

        </main>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     WARDEN DASHBOARD
  ════════════════════════════════════════════════ */
  if (user.role === "warden") {
    return (
      <div className="dash dash--warden">
        <main className="dash__main">

          {/* Warden hero — split layout */}
          <section className="warden-hero">
            <div className="warden-hero__left">
              <p className="overline">{greeting()}</p>
              <h1>{user.name}</h1>
              <p className="subtitle">Manage and resolve student complaints efficiently.</p>
              <div className="warden-badge"><Shield size={12}/> Warden</div>
            </div>
            <div className="warden-hero__stats">
              <div className="warden-stat warden-stat--amber">
                <AlertTriangle size={22}/>
                <div>
                  <span className="warden-stat__num">{stats.complaints.pending}</span>
                  <span className="warden-stat__label">Pending</span>
                </div>
              </div>
              <div className="warden-stat warden-stat--emerald">
                <CheckCircle size={22}/>
                <div>
                  <span className="warden-stat__num">{countResolvedToday()}</span>
                  <span className="warden-stat__label">Resolved Today</span>
                </div>
              </div>
            </div>
          </section>

          {/* Priority strip */}
          {stats.complaints.pending > 0 && (
            <div className="priority-banner" onClick={() => navigate("/warden/complaints")}>
              <AlertCircle size={16}/>
              <span>You have <strong>{stats.complaints.pending} pending complaint{stats.complaints.pending > 1 ? "s" : ""}</strong> waiting for review.</span>
              <ArrowUpRight size={15}/>
            </div>
          )}

          {/* Action cards */}
          <section className="section">
            <h2 className="section__title">Your Workspace</h2>
            <div className="action-grid action-grid--2">
              <ActionCard
                icon={<AlertCircle size={24}/>}
                title="Complaints"
                desc="Review, respond and resolve student complaints"
                accent="amber"
                badge={stats.complaints.pending > 0 ? `${stats.complaints.pending} pending` : null}
                badgeColor="amber"
                large
                onClick={() => navigate("/warden/complaints")}
              />
              <ActionCard
                icon={<Utensils size={24}/>}
                title="Meal Management"
                desc="Update today's menu and manage the meal schedule"
                accent="emerald"
                large
                onClick={() => navigate("/warden/meals")}
              />
            </div>
          </section>

          {/* Quick summary */}
          <section className="section">
            <h2 className="section__title">Today at a Glance</h2>
            <div className="glance-row">
              <GlanceItem icon={<Clock size={16}/>}         label="Shift"        value="On Duty" />
              <GlanceItem icon={<AlertTriangle size={16}/>} label="Open Issues"  value={stats.complaints.pending} />
              <GlanceItem icon={<CheckCircle size={16}/>}   label="Closed Today" value={countResolvedToday()} />
              <GlanceItem icon={<Utensils size={16}/>}      label="Total Resolved" value={stats.complaints.resolved} />
            </div>
          </section>

        </main>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     STUDENT DASHBOARD
  ════════════════════════════════════════════════ */
  if (user.role === "student") {
    return (
      <div className="dash dash--student">
        <main className="dash__main">

          {/* Profile incomplete alert */}
          {!profileStatus.loading && !profileStatus.submitted && (
            <div className="alert-banner" onClick={() => navigate("/student/profile")}>
              <AlertCircle size={15}/>
              <span>Complete your profile to unlock all features.</span>
              <span className="alert-banner__cta">Complete now <ArrowUpRight size={13}/></span>
            </div>
          )}

          {/* Student hero */}
          <section className="student-hero">
            <div className="student-hero__avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="student-hero__text">
              <p className="overline">{greeting()}</p>
              <h1>{user.name}</h1>
              <p className="subtitle">Welcome to your hostel portal. Manage everything in one place.</p>
            </div>
            <div className="student-badge"><BookOpen size={12}/> Student</div>
          </section>

          {/* Status chips */}
          <div className="status-chips">
            <div className={`status-chip ${profileStatus.submitted ? "status-chip--green" : "status-chip--amber"}`}>
              {profileStatus.submitted ? <CheckCircle size={13}/> : <AlertCircle size={13}/>}
              Profile {profileStatus.submitted ? "Complete" : "Incomplete"}
            </div>
            <div className={`status-chip ${studentPending > 0 ? "status-chip--amber" : "status-chip--green"}`}>
              <Wrench size={13}/>
              {studentPending > 0 ? `${studentPending} Complaint Pending` : "No Open Complaints"}
            </div>
            <div className="status-chip status-chip--blue">
              <Home size={13}/>
              Resident
            </div>
          </div>

          {/* Action cards — 2×2 grid */}
          <section className="section">
            <h2 className="section__title">My Services</h2>
            <div className="student-grid">

              <ActionCard
                icon={<UserCheck size={22}/>}
                title={profileStatus.submitted ? "Profile Submitted" : "Complete Profile"}
                desc="Personal info, room details & documents"
                accent={profileStatus.submitted ? "emerald" : "blue"}
                badge={profileStatus.submitted ? "✓ Done" : "Required"}
                badgeColor={profileStatus.submitted ? "emerald" : "red"}
                onClick={() => navigate("/student/profile")}
              />

              <ActionCard
                icon={<Wrench size={22}/>}
                title="Complaints"
                desc="Submit and track maintenance requests"
                accent="violet"
                badge={studentPending > 0 ? `${studentPending} Pending` : studentResolved > 0 ? "All Resolved" : null}
                badgeColor={studentPending > 0 ? "amber" : "emerald"}
                onClick={() => navigate("/complaints")}
              />

              <ActionCard
                icon={<CreditCard size={22}/>}
                title="Fee Payment"
                desc="Pay hostel fees and download receipts"
                accent="emerald"
                onClick={() => navigate("/payments")}
              />

              <ActionCard
                icon={<Utensils size={22}/>}
                title="Today's Meals"
                desc="View the daily meal plan & menu"
                accent="amber"
                onClick={() => navigate("/today/meals")}
              />

            </div>
          </section>

        </main>
      </div>
    );
  }

  return null;
}

/* ══════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════ */

function KpiCard({ label, value, icon, accent, sub }) {
  return (
    <div className={`kpi-card kpi-card--${accent}`}>
      <div className="kpi-card__top">
        <div className="kpi-card__icon">{icon}</div>
        {sub && <span className="kpi-card__sub">{sub}</span>}
      </div>
      <div className="kpi-card__value">{value}</div>
      <div className="kpi-card__label">{label}</div>
    </div>
  );
}

function ActionCard({ icon, title, desc, accent, badge, badgeColor = "amber", large, onClick }) {
  return (
    <div className={`action-card action-card--${accent} ${large ? "action-card--large" : ""}`} onClick={onClick}>
      <div className="action-card__icon">{icon}</div>
      <div className="action-card__body">
        <h3>{title}</h3>
        {desc && <p>{desc}</p>}
      </div>
      {badge && <span className={`badge badge--${badgeColor}`}>{badge}</span>}
      <ChevronRight className="action-card__arrow" size={17}/>
    </div>
  );
}

function AnalyticTile({ icon, label, value, color }) {
  return (
    <div className={`analytic-tile analytic-tile--${color}`}>
      <div className="analytic-tile__icon">{icon}</div>
      <div className="analytic-tile__value">{value}</div>
      <div className="analytic-tile__label">{label}</div>
    </div>
  );
}

function StatusRow({ label, value, dot }) {
  return (
    <div className="status-row">
      <span className={`dot dot--${dot}`}/>
      <span className="status-row__label">{label}</span>
      <span className="status-row__value">{value}</span>
    </div>
  );
}

function GlanceItem({ icon, label, value }) {
  return (
    <div className="glance-item">
      <div className="glance-item__icon">{icon}</div>
      <div className="glance-item__label">{label}</div>
      <div className="glance-item__value">{value}</div>
    </div>
  );
}