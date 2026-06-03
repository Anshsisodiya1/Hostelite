import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/dashboard.css";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "../firebase";
import Wardendashboard from "./Wardendashboard";

import {
  Users,
  UserCheck,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Utensils,
  Wrench,
  ChevronRight,
  CheckCircle,
  ArrowUpRight,
  Activity,
  Home,
  BookOpen,
  BarChart3,
  Settings,
  Shield,
  Phone,
  BedDouble,
  Mail,
  ArrowRight,
  Bell,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getTimeEmoji = () => {
  const h = new Date().getHours();
  if (h < 12) return "☀️";
  if (h < 17) return "🌤️";
  return "🌙";
};

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
  const [profileStatus, setProfileStatus] = useState({ loading: true, submitted: false });
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (!user) return;
    const messaging = getMessaging(app);
    const VAPID_KEY =
      "BGvkWr3pS-UBnhLSLAprlPSDRoP76mg7UDSeT2YjmL-3YoM1dp2lvSy0p4WtDs-Yn4cRvCDFD6kFsRsGG1tFsSc";
    Notification.requestPermission().then(async (p) => {
      if (p === "granted") {
        try {
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) await API.post("/users/save-token", { token });
        } catch (e) {
          console.error(e);
        }
      }
    });
    onMessage(messaging, (payload) =>
      alert(`${payload.notification?.title} - ${payload.notification?.body}`)
    );
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      fetchStats();
      fetchComplaints();
    }
    if (user.role === "student") {
      fetchProfileStatus();
      fetchComplaints();
      fetchDashboardContacts();
    }
  }, [user]);

  const fetchProfileStatus = async () => {
    try {
      const res = await API.get("/profile/me");
      setProfileStatus({ loading: false, submitted: res.data?.submitted || false });
    } catch {
      setProfileStatus({ loading: false, submitted: false });
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/users");
      const u = Array.isArray(res.data) ? res.data : [];
      setStats((p) => ({
        ...p,
        students: u.filter((x) => x.role === "student").length,
        wardens: u.filter((x) => x.role === "warden").length,
        total: u.length,
        payments: Math.floor(Math.random() * 50) + 10,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");
      const data = Array.isArray(res.data) ? res.data : [];
      setComplaints(data);
      setStats((p) => ({
        ...p,
        complaints: {
          pending: data.filter((c) => c.status === "pending").length,
          resolved: data.filter((c) => c.status === "resolved").length,
        },
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDashboardContacts = async () => {
    try {
      const res = await API.get("/users/dashboard-contacts");
      const { admin, warden } = res.data;
      const list = [];
      if (admin) list.push(admin);
      if (warden) list.push(warden);
      setContacts(list);
    } catch (e) {
      console.error("contacts error:", e);
    }
  };

  const studentPending = complaints.filter((c) => c.status === "pending").length;
  const studentResolved = complaints.filter((c) => c.status === "resolved").length;

  if (!user) return null;

  if (user.role === "warden") return <Wardendashboard />;

  /* ════════════════════════════════════════════════
     ADMIN DASHBOARD
  ════════════════════════════════════════════════ */
  if (user.role === "admin") {
    return (
      <div className="dash dash--admin">
        <main className="dash__main">
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

          <section className="kpi-grid kpi-grid--4">
            <KpiCard label="Total Users"    value={stats.total}              icon={<Users size={20} />}       accent="blue"    sub={`↑${Math.max(5, Math.floor(stats.total * 0.1))}% this month`} />
            <KpiCard label="Students"       value={stats.students}           icon={<UserCheck size={20} />}   accent="emerald" sub="Active residents" />
            <KpiCard label="Wardens"        value={stats.wardens}            icon={<Shield size={20} />}      accent="violet"  sub="On duty" />
            <KpiCard label="Pending Issues" value={stats.complaints.pending} icon={<AlertCircle size={20} />} accent="amber"   sub={`${stats.complaints.resolved} resolved`} />
          </section>

          <section className="analytics-row">
            <div className="analytics-panel">
              <div className="panel-head"><BarChart3 size={16} /><h2>Quick Analytics</h2></div>
              <div className="analytics-tiles">
                <AnalyticTile icon={<TrendingUp size={18} />}  label="User Growth"         value={`+${Math.max(5, Math.floor(stats.total * 0.1))}%`} color="blue" />
                <AnalyticTile icon={<AlertCircle size={18} />} label="Pending Complaints"  value={stats.complaints.pending}  color="amber" />
                <AnalyticTile icon={<CheckCircle size={18} />} label="Resolved Complaints" value={stats.complaints.resolved} color="emerald" />
              </div>
            </div>
            <div className="activity-panel">
              <div className="panel-head"><Activity size={16} /><h2>Complaint Overview</h2></div>
              <div className="status-list">
                <StatusRow label="Total Complaints" value={stats.complaints.pending + stats.complaints.resolved} dot="blue" />
                <StatusRow label="Pending"          value={stats.complaints.pending}  dot={stats.complaints.pending > 0 ? "amber" : "green"} />
                <StatusRow label="Resolved"         value={stats.complaints.resolved} dot="green" />
                <StatusRow
                  label="Resolution Rate"
                  value={stats.complaints.pending + stats.complaints.resolved > 0
                    ? `${Math.round((stats.complaints.resolved / (stats.complaints.pending + stats.complaints.resolved)) * 100)}%`
                    : "N/A"}
                  dot="green"
                />
              </div>
            </div>
          </section>

          <section className="section">
            <h2 className="section__title">Quick Actions</h2>
            <div className="action-grid action-grid--4">
              <ActionCard icon={<Users size={22} />}      title="Manage Users"    desc="Add, edit and manage accounts"   accent="blue"    onClick={() => navigate("/admin/users")} />
              <ActionCard icon={<CreditCard size={22} />} title="Payments"        desc="Track fees, dues and receipts"   accent="emerald" onClick={() => navigate("/admin/payments")} />
              <ActionCard icon={<BarChart3 size={22} />}  title="Reports"         desc="Occupancy & financial reports"   accent="violet"  onClick={() => navigate("/admin/report")} />
              <ActionCard icon={<Settings size={22} />}   title="System Settings" desc="Rooms, floors & configuration"   accent="slate"   onClick={() => navigate("/admin/system-settings")} />
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     STUDENT DASHBOARD — REDESIGNED
  ════════════════════════════════════════════════ */
  if (user.role === "student") {
    const firstName = user.name?.split(" ")[0] || user.name;
    const totalComplaints = studentPending + studentResolved;
    const resolutionRate = totalComplaints > 0
      ? Math.round((studentResolved / totalComplaints) * 100)
      : 100;

    return (
      <div className="dash dash--student">
        <main className="sdash">

          {/* ── Profile incomplete banner ── */}
          {!profileStatus.loading && !profileStatus.submitted && (
            <div className="s-alert" onClick={() => navigate("/student/profile")}>
              <div className="s-alert__icon"><Zap size={14} /></div>
              <div className="s-alert__text">
                <strong>Complete your profile</strong>
                <span>Add your details to unlock all hostel features</span>
              </div>
              <button className="s-alert__btn">
                Set up now <ArrowRight size={13} />
              </button>
            </div>
          )}

          {/* ── Hero ── */}
          <div className="s-hero">
            <div className="s-hero__left">
              <div className="s-hero__avatar">
                {user.name?.charAt(0).toUpperCase()}
                <span className="s-hero__avatar-ring" />
              </div>
              <div className="s-hero__text">
                <p className="s-hero__greeting">{greeting()} {getTimeEmoji()}</p>
                <h1 className="s-hero__name">{firstName}</h1>
                <div className="s-hero__chips">
                  <span className="s-chip s-chip--blue"><Home size={11} /> Resident</span>
                  <span className={`s-chip ${profileStatus.submitted ? "s-chip--green" : "s-chip--orange"}`}>
                    {profileStatus.submitted ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                    {profileStatus.submitted ? "Profile complete" : "Profile incomplete"}
                  </span>
                </div>
              </div>
            </div>
            <div className="s-hero__stats">
              <div className="s-hero__stat">
                <span className="s-hero__stat-val">{studentPending}</span>
                <span className="s-hero__stat-label">Open issues</span>
              </div>
              <div className="s-hero__stat-div" />
              <div className="s-hero__stat">
                <span className="s-hero__stat-val">{studentResolved}</span>
                <span className="s-hero__stat-label">Resolved</span>
              </div>
              <div className="s-hero__stat-div" />
              <div className="s-hero__stat">
                <span className="s-hero__stat-val">{resolutionRate}%</span>
                <span className="s-hero__stat-label">Resolution rate</span>
              </div>
            </div>
          </div>

          {/* ── Services grid ── */}
          <div className="s-section">
            <div className="s-section__head">
              <h2 className="s-section__title">My Services</h2>
              <p className="s-section__sub">Everything you need, in one place</p>
            </div>
            <div className="s-services">
              <ServiceCard
                icon={<UserCheck size={24} />}
                title={profileStatus.submitted ? "Profile" : "Complete Profile"}
                desc={profileStatus.submitted ? "Your details are on file" : "Required to access all features"}
                accent="blue"
                tag={profileStatus.submitted ? "Complete" : "Action needed"}
                tagType={profileStatus.submitted ? "success" : "warning"}
                onClick={() => navigate("/student/profile")}
              />
              <ServiceCard
                icon={<Wrench size={24} />}
                title="Complaints"
                desc="Submit and track maintenance requests"
                accent="violet"
                tag={studentPending > 0 ? `${studentPending} pending` : studentResolved > 0 ? "All clear" : null}
                tagType={studentPending > 0 ? "warning" : "success"}
                onClick={() => navigate("/complaints")}
              />
              <ServiceCard
                icon={<CreditCard size={24} />}
                title="Fee Payment"
                desc="Pay hostel fees and download receipts"
                accent="emerald"
                onClick={() => navigate("/payments")}
              />
              <ServiceCard
                icon={<Utensils size={24} />}
                title="Today's Meals"
                desc="View the daily meal plan & menu"
                accent="amber"
                onClick={() => navigate("/today/meals")}
              />
            </div>
          </div>

          {/* ── Contacts ── */}
          {contacts.length > 0 && (
            <div className="s-section">
              <div className="s-section__head">
                <h2 className="s-section__title">Your Contacts</h2>
                <p className="s-section__sub">Reach out to your hostel team</p>
              </div>
              <div className="s-contacts">
                {contacts.map((c) => (
                  <ContactCard key={c._id} contact={c} />
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  return null;
}

/* ════════════════════════════════════════════════
   ADMIN COMPONENTS
════════════════════════════════════════════════ */

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
    <div
      className={`action-card action-card--${accent} ${large ? "action-card--large" : ""}`}
      onClick={onClick}
    >
      <div className="action-card__icon">{icon}</div>
      <div className="action-card__body">
        <h3>{title}</h3>
        {desc && <p>{desc}</p>}
      </div>
      {badge && <span className={`badge badge--${badgeColor}`}>{badge}</span>}
      <ChevronRight className="action-card__arrow" size={17} />
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
      <span className={`dot dot--${dot}`} />
      <span className="status-row__label">{label}</span>
      <span className="status-row__value">{value}</span>
    </div>
  );
}

/* ════════════════════════════════════════════════
   STUDENT COMPONENTS
════════════════════════════════════════════════ */

function ServiceCard({ icon, title, desc, accent, tag, tagType, onClick }) {
  return (
    <div className={`svc-card svc-card--${accent}`} onClick={onClick} role="button" tabIndex={0}>
      <div className="svc-card__top">
        <div className="svc-card__icon">{icon}</div>
        {tag && (
          <span className={`svc-tag svc-tag--${tagType}`}>{tag}</span>
        )}
      </div>
      <div className="svc-card__body">
        <h3 className="svc-card__title">{title}</h3>
        <p className="svc-card__desc">{desc}</p>
      </div>
      <div className="svc-card__footer">
        <span className="svc-card__cta">Open <ArrowRight size={13} /></span>
      </div>
    </div>
  );
}

function ContactCard({ contact }) {
  const isAdmin = contact.role === "admin";
  const accent = isAdmin ? "blue" : "violet";
  const initials = contact.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`contact-card contact-card--${accent}`}>
      <div className="contact-card__avatar">{initials}</div>
      <div className="contact-card__body">
        <div className="contact-card__top-row">
          <span className={`contact-role-badge contact-role-badge--${accent}`}>
            {isAdmin ? <Shield size={10} /> : <BedDouble size={10} />}
            {isAdmin ? "Admin" : "Warden"}
          </span>
        </div>
        <h3 className="contact-card__name">{contact.name}</h3>
        <div className="contact-card__links">
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="contact-link">
              <Mail size={12} />
              <span>{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone}`} className="contact-link">
              <Phone size={12} />
              <span>{contact.phone}</span>
            </a>
          )}
        </div>
      </div>
      <div className="contact-card__action">
        {contact.email && (
          <a href={`mailto:${contact.email}`} className="contact-action-btn">
            <Mail size={15} />
          </a>
        )}
        {contact.phone && (
          <a href={`tel:${contact.phone}`} className="contact-action-btn">
            <Phone size={15} />
          </a>
        )}
      </div>
    </div>
  );
}