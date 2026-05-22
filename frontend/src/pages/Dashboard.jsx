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
  TrendingUp,
  CreditCard,
  AlertCircle,
  Utensils,
  Wrench,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Home,
  BookOpen,
  Clock,
  BarChart3,
  Settings,
  Shield,
  DoorOpen,
  Phone,
  GraduationCap,
  BedDouble,
  Search,
  Building2,
  Hash,
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

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [stats, setStats] = useState({
    students: 0,
    wardens: 0,
    total: 0,
    payments: 0,
    complaints: {
      pending: 0,
      resolved: 0,
    },
  });

  const [complaints, setComplaints] = useState([]);
  const [profileStatus, setProfileStatus] = useState({
    loading: true,
    submitted: false,
  });

  /* ── Firebase ── */
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
      alert(`${payload.notification?.title} - ${payload.notification?.body}`),
    );
  }, [user]);

  /* ── Data ── */
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      fetchStats();
      fetchComplaints();
    }
    if (user.role === "warden") {
      fetchComplaints();
      fetchWardenFloorData();
    }
    if (user.role === "student") {
      fetchProfileStatus();
      fetchComplaints();
    }
  }, [user]);

  /* ── Fetch floor students and rooms for warden ── */
  const fetchWardenFloorData = async () => {
    try {
      // Fetch all students and filter by warden's floor
      const studentsRes = await API.get("/users");
      const allUsers = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const floorStudents = allUsers.filter(
        (u) => u.role === "student" && u.floor === user.floor,
      );
      setStudents(floorStudents);

      // Fetch rooms for warden's floor
      const roomsRes = await API.get(`/rooms?floor=${user.floor}`);
      const floorRooms = Array.isArray(roomsRes.data) ? roomsRes.data : [];
      setRooms(floorRooms);
    } catch (e) {
      console.error("Error fetching warden floor data:", e);
    }
  };

  const fetchProfileStatus = async () => {
    try {
      const res = await API.get("/profile/me");
      setProfileStatus({
        loading: false,
        submitted: res.data?.submitted || false,
      });
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

  const countResolvedToday = () => {
    const t = new Date();
    return complaints.filter((c) => {
      if (c.status !== "resolved") return false;
      const d = new Date(c.updatedAt || c.createdAt);
      return (
        d.getDate() === t.getDate() &&
        d.getMonth() === t.getMonth() &&
        d.getFullYear() === t.getFullYear()
      );
    }).length;
  };

  const studentPending = complaints.filter(
    (c) => c.status === "pending",
  ).length;
  const studentResolved = complaints.filter(
    (c) => c.status === "resolved",
  ).length;

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
              <p className="subtitle">
                Here's what's happening across your hostel today.
              </p>
            </div>
            <div className="admin-hero__badge">
              <Shield size={13} /> Admin
            </div>
          </section>

          {/* KPI strip */}
          <section className="kpi-grid kpi-grid--4">
            <KpiCard
              label="Total Users"
              value={stats.total}
              icon={<Users size={20} />}
              accent="blue"
              sub={`↑${Math.max(5, Math.floor(stats.total * 0.1))}% this month`}
            />
            <KpiCard
              label="Students"
              value={stats.students}
              icon={<UserCheck size={20} />}
              accent="emerald"
              sub="Active residents"
            />
            <KpiCard
              label="Wardens"
              value={stats.wardens}
              icon={<Shield size={20} />}
              accent="violet"
              sub="On duty"
            />
            <KpiCard
              label="Pending Issues"
              value={stats.complaints.pending}
              icon={<AlertCircle size={20} />}
              accent="amber"
              sub={`${stats.complaints.resolved} resolved`}
            />
          </section>

          {/* Analytics row */}
          <section className="analytics-row">
            <div className="analytics-panel">
              <div className="panel-head">
                <BarChart3 size={16} />
                <h2>Quick Analytics</h2>
              </div>
              <div className="analytics-tiles">
                <AnalyticTile
                  icon={<TrendingUp size={18} />}
                  label="User Growth"
                  value={`+${Math.max(5, Math.floor(stats.total * 0.1))}%`}
                  color="blue"
                />
                <AnalyticTile
                  icon={<AlertCircle size={18} />}
                  label="Pending Complaints"
                  value={stats.complaints.pending}
                  color="amber"
                />
                <AnalyticTile
                  icon={<CheckCircle size={18} />}
                  label="Resolved Complaints"
                  value={stats.complaints.resolved}
                  color="emerald"
                />
              </div>
            </div>

            <div className="activity-panel">
              <div className="panel-head">
                <Activity size={16} />
                <h2>Complaint Overview</h2>
              </div>
              <div className="status-list">
                <StatusRow
                  label="Total Complaints"
                  value={stats.complaints.pending + stats.complaints.resolved}
                  dot="blue"
                />
                <StatusRow
                  label="Pending"
                  value={stats.complaints.pending}
                  dot={stats.complaints.pending > 0 ? "amber" : "green"}
                />
                <StatusRow
                  label="Resolved"
                  value={stats.complaints.resolved}
                  dot="green"
                />
                <StatusRow
                  label="Resolution Rate"
                  value={
                    stats.complaints.pending + stats.complaints.resolved > 0
                      ? `${Math.round(
                          (stats.complaints.resolved /
                            (stats.complaints.pending +
                              stats.complaints.resolved)) *
                            100,
                        )}%`
                      : "N/A"
                  }
                  dot="green"
                />
              </div>
            </div>
          </section>

          {/* Action cards */}
          <section className="section">
            <h2 className="section__title">Quick Actions</h2>
            <div className="action-grid action-grid--4">
              <ActionCard
                icon={<Users size={22} />}
                title="Manage Users"
                desc="Add, edit and manage accounts"
                accent="blue"
                onClick={() => navigate("/admin/users")}
              />
              <ActionCard
                icon={<CreditCard size={22} />}
                title="Payments"
                desc="Track fees, dues and receipts"
                accent="emerald"
                onClick={() => navigate("/admin/payments")}
              />
              <ActionCard
                icon={<BarChart3 size={22} />}
                title="Reports"
                desc="Occupancy & financial reports"
                accent="violet"
                onClick={() => navigate("/admin/report")}
              />
              <ActionCard
                icon={<Settings size={22} />}
                title="System Settings"
                desc="Rooms, floors & configuration"
                accent="slate"
                onClick={() => navigate("/admin/system-settings")}
              />
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
    // Floor-specific calculations
    const floorStudents = students.filter(
      (s) => s.floor === user.floor || s.roomNumber?.toString().startsWith(user.floor),
    );

    // Unique occupied rooms
    const occupiedRoomNos = [
      ...new Set(
        floorStudents
          .map((s) => s.roomNumber)
          .filter(Boolean),
      ),
    ];

    const totalRooms = rooms.length || 0;
    const occupiedRooms = occupiedRoomNos.length;
    const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
    const totalStudents = floorStudents.length;

    // Occupancy percentage
    const occupancyPct =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Filtered student list
    const filteredStudents = floorStudents.filter((s) => {
      const q = searchTerm.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.branch?.toLowerCase().includes(q) ||
        s.roomNumber?.toString().includes(q)
      );
    });

    return (
      <div className="dash dash--warden">
        <main className="dash__main">

          {/* ── Warden Hero ── */}
          <section className="warden-hero">
            <div className="warden-hero__left">
              <p className="overline">{greeting()}</p>
              <h1>{user.name}</h1>
              <p className="subtitle">
                Monitor your floor, manage complaints and keep hostel operations running smoothly.
              </p>
              <div className="warden-badge">
                <Shield size={12} /> Floor Warden — Floor {user.floor}
              </div>
            </div>

            <div className="warden-hero__stats">
              <div className="warden-stat warden-stat--amber">
                <AlertTriangle size={22} />
                <div>
                  <span className="warden-stat__num">
                    {stats.complaints.pending}
                  </span>
                  <span className="warden-stat__label">Pending</span>
                </div>
              </div>

              <div className="warden-stat warden-stat--emerald">
                <CheckCircle size={22} />
                <div>
                  <span className="warden-stat__num">
                    {countResolvedToday()}
                  </span>
                  <span className="warden-stat__label">Resolved Today</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── Pending Complaints Banner ── */}
          {stats.complaints.pending > 0 && (
            <div
              className="priority-banner"
              onClick={() => navigate("/warden/complaints")}
            >
              <AlertCircle size={16} />
              <span>
                You have{" "}
                <strong>
                  {stats.complaints.pending} pending complaint
                  {stats.complaints.pending > 1 ? "s" : ""}
                </strong>{" "}
                waiting for review.
              </span>
              <ArrowUpRight size={15} />
            </div>
          )}

          {/* ── Floor Analytics ── */}
          <section className="section">
            <h2 className="section__title">Floor {user.floor} — Room Analytics</h2>

            <div className="floor-analytics-grid">
              {/* Big occupancy card */}
              <div className="floor-occupancy-card">
                <div className="floor-occupancy-card__header">
                  <div className="floor-occupancy-card__icon">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <p className="floor-occupancy-card__label">Occupancy Rate</p>
                    <p className="floor-occupancy-card__floor">Floor {user.floor}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="occupancy-bar-wrap">
                  <div className="occupancy-bar">
                    <div
                      className="occupancy-bar__fill"
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  <span className="occupancy-pct">{occupancyPct}%</span>
                </div>

                <div className="floor-occupancy-card__stats">
                  <div className="occ-stat">
                    <span className="occ-stat__num occ-stat__num--blue">{totalRooms}</span>
                    <span className="occ-stat__label">Total Rooms</span>
                  </div>
                  <div className="occ-divider" />
                  <div className="occ-stat">
                    <span className="occ-stat__num occ-stat__num--emerald">{occupiedRooms}</span>
                    <span className="occ-stat__label">Occupied</span>
                  </div>
                  <div className="occ-divider" />
                  <div className="occ-stat">
                    <span className="occ-stat__num occ-stat__num--amber">{vacantRooms}</span>
                    <span className="occ-stat__label">Vacant</span>
                  </div>
                </div>
              </div>

              {/* Right KPI tiles */}
              <div className="floor-kpi-col">
                <div className="floor-kpi-tile floor-kpi-tile--blue">
                  <div className="floor-kpi-tile__icon">
                    <Users size={20} />
                  </div>
                  <div className="floor-kpi-tile__body">
                    <span className="floor-kpi-tile__value">{totalStudents}</span>
                    <span className="floor-kpi-tile__label">Total Students</span>
                    <span className="floor-kpi-tile__sub">on floor {user.floor}</span>
                  </div>
                </div>

                <div className="floor-kpi-tile floor-kpi-tile--emerald">
                  <div className="floor-kpi-tile__icon">
                    <BedDouble size={20} />
                  </div>
                  <div className="floor-kpi-tile__body">
                    <span className="floor-kpi-tile__value">{occupiedRooms}</span>
                    <span className="floor-kpi-tile__label">Occupied Rooms</span>
                    <span className="floor-kpi-tile__sub">
                      {occupancyPct}% occupancy
                    </span>
                  </div>
                </div>

                <div className="floor-kpi-tile floor-kpi-tile--amber">
                  <div className="floor-kpi-tile__icon">
                    <DoorOpen size={20} />
                  </div>
                  <div className="floor-kpi-tile__body">
                    <span className="floor-kpi-tile__value">{vacantRooms}</span>
                    <span className="floor-kpi-tile__label">Vacant Rooms</span>
                    <span className="floor-kpi-tile__sub">available to assign</span>
                  </div>
                </div>

                <div className="floor-kpi-tile floor-kpi-tile--violet">
                  <div className="floor-kpi-tile__icon">
                    <AlertCircle size={20} />
                  </div>
                  <div className="floor-kpi-tile__body">
                    <span className="floor-kpi-tile__value">
                      {stats.complaints.pending}
                    </span>
                    <span className="floor-kpi-tile__label">Open Complaints</span>
                    <span className="floor-kpi-tile__sub">
                      {stats.complaints.resolved} resolved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Quick Actions ── */}
          <section className="section">
            <h2 className="section__title">Your Workspace</h2>
            <div className="action-grid action-grid--2">
              <ActionCard
                icon={<AlertCircle size={24} />}
                title="Complaints"
                desc="Review and resolve student complaints"
                accent="amber"
                badge={
                  stats.complaints.pending > 0
                    ? `${stats.complaints.pending} pending`
                    : null
                }
                badgeColor="amber"
                large
                onClick={() => navigate("/warden/complaints")}
              />
              <ActionCard
                icon={<Utensils size={24} />}
                title="Meal Management"
                desc="Update meals and hostel menu"
                accent="emerald"
                large
                onClick={() => navigate("/warden/meals")}
              />
            </div>
          </section>

          {/* ── Students Table ── */}
          <section className="section">
            <div className="student-table-header">
              <div>
                <h2 className="section__title">Students on Floor {user.floor}</h2>
                <p className="student-table-count">
                  {filteredStudents.length} of {totalStudents} students
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>

              <div className="search-box">
                <Search size={15} className="search-box__icon" />
                <input
                  type="text"
                  placeholder="Search by name, email, branch or room..."
                  className="search-box__input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="student-table-wrap">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>
                      <span className="th-inner"><Users size={13} /> Student</span>
                    </th>
                    <th>
                      <span className="th-inner"><Phone size={13} /> Phone</span>
                    </th>
                    <th>
                      <span className="th-inner"><GraduationCap size={13} /> Branch</span>
                    </th>
                    <th>
                      <span className="th-inner"><Hash size={13} /> Room No.</span>
                    </th>
                    <th>
                      <span className="th-inner"><Shield size={13} /> Status</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="table-empty">
                          <Users size={32} />
                          <p>
                            {searchTerm
                              ? `No students found matching "${searchTerm}"`
                              : "No students assigned to this floor yet"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student._id}>
                        {/* Name + Email combined */}
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {student.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="student-cell__info">
                              <span className="student-cell__name">
                                {student.name || "—"}
                              </span>
                              <span className="student-cell__email">
                                {student.email || "—"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td>
                          <span className="td-mono">
                            {student.phone || student.phoneNumber || "—"}
                          </span>
                        </td>

                        {/* Branch */}
                        <td>
                          <span className="branch-tag">
                            {student.branch || student.department || "—"}
                          </span>
                        </td>

                        {/* Room No */}
                        <td>
                          <span className="room-tag">
                            {student.roomNumber || "—"}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`status-badge ${
                              student.status === "active"
                                ? "status-badge--green"
                                : "status-badge--red"
                            }`}
                          >
                            {student.status === "active" ? (
                              <CheckCircle size={11} />
                            ) : (
                              <AlertCircle size={11} />
                            )}
                            {student.status || "inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Today at a Glance ── */}
          <section className="section">
            <h2 className="section__title">Today at a Glance</h2>
            <div className="glance-row">
              <GlanceItem
                icon={<Clock size={16} />}
                label="Shift"
                value="On Duty"
              />
              <GlanceItem
                icon={<CheckCircle size={16} />}
                label="Closed Today"
                value={countResolvedToday()}
              />
              <GlanceItem
                icon={<Users size={16} />}
                label="Floor Students"
                value={totalStudents}
              />
              <GlanceItem
                icon={<Utensils size={16} />}
                label="Total Resolved"
                value={stats.complaints.resolved}
              />
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
            <div
              className="alert-banner"
              onClick={() => navigate("/student/profile")}
            >
              <AlertCircle size={15} />
              <span>Complete your profile to unlock all features.</span>
              <span className="alert-banner__cta">
                Complete now <ArrowUpRight size={13} />
              </span>
            </div>
          )}

          {/* Student hero */}
          <section className="student-hero">
            <div className="student-hero__avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="student-hero__text">
              <p className="overline">{greeting()}</p>
              <h1>{user.name}</h1>
              <p className="subtitle">
                Welcome to your hostel portal. Manage everything in one place.
              </p>
            </div>
            <div className="student-badge">
              <BookOpen size={12} /> Student
            </div>
          </section>

          {/* Status chips */}
          <div className="status-chips">
            <div
              className={`status-chip ${profileStatus.submitted ? "status-chip--green" : "status-chip--amber"}`}
            >
              {profileStatus.submitted ? (
                <CheckCircle size={13} />
              ) : (
                <AlertCircle size={13} />
              )}
              Profile {profileStatus.submitted ? "Complete" : "Incomplete"}
            </div>
            <div
              className={`status-chip ${studentPending > 0 ? "status-chip--amber" : "status-chip--green"}`}
            >
              <Wrench size={13} />
              {studentPending > 0
                ? `${studentPending} Complaint Pending`
                : "No Open Complaints"}
            </div>
            <div className="status-chip status-chip--blue">
              <Home size={13} />
              Resident
            </div>
          </div>

          {/* Action cards — 2×2 grid */}
          <section className="section">
            <h2 className="section__title">My Services</h2>
            <div className="student-grid">
              <ActionCard
                icon={<UserCheck size={22} />}
                title={
                  profileStatus.submitted
                    ? "Profile Submitted"
                    : "Complete Profile"
                }
                desc="Personal info, room details & documents"
                accent={profileStatus.submitted ? "emerald" : "blue"}
                badge={profileStatus.submitted ? "✓ Done" : "Required"}
                badgeColor={profileStatus.submitted ? "emerald" : "red"}
                onClick={() => navigate("/student/profile")}
              />

              <ActionCard
                icon={<Wrench size={22} />}
                title="Complaints"
                desc="Submit and track maintenance requests"
                accent="violet"
                badge={
                  studentPending > 0
                    ? `${studentPending} Pending`
                    : studentResolved > 0
                      ? "All Resolved"
                      : null
                }
                badgeColor={studentPending > 0 ? "amber" : "emerald"}
                onClick={() => navigate("/complaints")}
              />

              <ActionCard
                icon={<CreditCard size={22} />}
                title="Fee Payment"
                desc="Pay hostel fees and download receipts"
                accent="emerald"
                onClick={() => navigate("/payments")}
              />

              <ActionCard
                icon={<Utensils size={22} />}
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

function ActionCard({
  icon,
  title,
  desc,
  accent,
  badge,
  badgeColor = "amber",
  large,
  onClick,
}) {
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

function GlanceItem({ icon, label, value }) {
  return (
    <div className="glance-item">
      <div className="glance-item__icon">{icon}</div>
      <div className="glance-item__label">{label}</div>
      <div className="glance-item__value">{value}</div>
    </div>
  );
}