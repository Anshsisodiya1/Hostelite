import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import "../styles/dashboard.css";
import axios from "axios";
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
  X,
  ChevronDown,
  ChevronUp,
  KeyRound,
  TrendingDown,
  Zap,
  Eye,
  MoreHorizontal,
  ArrowRight,
  Layers,
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
  const [rooms, setRooms] = useState([]);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [floorStudents, setFloorStudents] = useState([]);
  const [roomRequestCount, setRoomRequestCount] = useState(0);

  useEffect(() => {
    const fetchFloorStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/warden/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFloorStudents(res.data.students || []);
        setRooms(res.data.rooms || []);
      } catch (error) {
        console.error("Failed to fetch floor students:", error);
        setFloorStudents([]);
        setRooms([]);
      }
    };

    const fetchRoomRequestCount = async () => {
      try {
        const res = await API.get("/room-requests/warden/pending-count");
        setRoomRequestCount(res.data.count || 0);
      } catch (err) {
        console.error("Failed to fetch room request count:", err);
      }
    };

    if (user?.role === "warden") {
      fetchFloorStudents();
      fetchRoomRequestCount();
    }
  }, [user]);

  const [stats, setStats] = useState({
    students: 0,
    wardens: 0,
    total: 0,
    payments: 0,
    complaints: { pending: 0, resolved: 0 },
  });

  const [complaints, setComplaints] = useState([]);
  const [profileStatus, setProfileStatus] = useState({ loading: true, submitted: false });

  useEffect(() => {
    if (!user) return;
    const messaging = getMessaging(app);
    const VAPID_KEY = "BGvkWr3pS-UBnhLSLAprlPSDRoP76mg7UDSeT2YjmL-3YoM1dp2lvSy0p4WtDs-Yn4cRvCDFD6kFsRsGG1tFsSc";
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
    if (user.role === "admin") { fetchStats(); fetchComplaints(); }
    if (user.role === "student") { fetchProfileStatus(); fetchComplaints(); }
    if (user.role === "warden") { fetchComplaints(); }
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

  const studentPending = complaints.filter((c) => c.status === "pending").length;
  const studentResolved = complaints.filter((c) => c.status === "resolved").length;

  if (!user) return null;

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
            <KpiCard label="Total Users" value={stats.total} icon={<Users size={20} />} accent="blue" sub={`↑${Math.max(5, Math.floor(stats.total * 0.1))}% this month`} />
            <KpiCard label="Students" value={stats.students} icon={<UserCheck size={20} />} accent="emerald" sub="Active residents" />
            <KpiCard label="Wardens" value={stats.wardens} icon={<Shield size={20} />} accent="violet" sub="On duty" />
            <KpiCard label="Pending Issues" value={stats.complaints.pending} icon={<AlertCircle size={20} />} accent="amber" sub={`${stats.complaints.resolved} resolved`} />
          </section>

          <section className="analytics-row">
            <div className="analytics-panel">
              <div className="panel-head"><BarChart3 size={16} /><h2>Quick Analytics</h2></div>
              <div className="analytics-tiles">
                <AnalyticTile icon={<TrendingUp size={18} />} label="User Growth" value={`+${Math.max(5, Math.floor(stats.total * 0.1))}%`} color="blue" />
                <AnalyticTile icon={<AlertCircle size={18} />} label="Pending Complaints" value={stats.complaints.pending} color="amber" />
                <AnalyticTile icon={<CheckCircle size={18} />} label="Resolved Complaints" value={stats.complaints.resolved} color="emerald" />
              </div>
            </div>
            <div className="activity-panel">
              <div className="panel-head"><Activity size={16} /><h2>Complaint Overview</h2></div>
              <div className="status-list">
                <StatusRow label="Total Complaints" value={stats.complaints.pending + stats.complaints.resolved} dot="blue" />
                <StatusRow label="Pending" value={stats.complaints.pending} dot={stats.complaints.pending > 0 ? "amber" : "green"} />
                <StatusRow label="Resolved" value={stats.complaints.resolved} dot="green" />
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
              <ActionCard icon={<Users size={22} />} title="Manage Users" desc="Add, edit and manage accounts" accent="blue" onClick={() => navigate("/admin/users")} />
              <ActionCard icon={<CreditCard size={22} />} title="Payments" desc="Track fees, dues and receipts" accent="emerald" onClick={() => navigate("/admin/payments")} />
              <ActionCard icon={<BarChart3 size={22} />} title="Reports" desc="Occupancy & financial reports" accent="violet" onClick={() => navigate("/admin/report")} />
              <ActionCard icon={<Settings size={22} />} title="System Settings" desc="Rooms, floors & configuration" accent="slate" onClick={() => navigate("/admin/system-settings")} />
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     WARDEN DASHBOARD — MODERN REDESIGN
  ════════════════════════════════════════════════ */
  if (user.role === "warden") {
    const safeFloorStudents = Array.isArray(floorStudents) ? floorStudents : [];
    const occupiedRoomNos = [...new Set(safeFloorStudents.map((s) => s.roomNumber).filter(Boolean))];
    const totalRooms = rooms?.length || 0;
    const occupiedRooms = occupiedRoomNos.length;
    const vacantRooms = Math.max(0, totalRooms - occupiedRooms);
    const totalStudents = safeFloorStudents.length;
    const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    const resolutionRate = (stats.complaints.pending + stats.complaints.resolved) > 0
      ? Math.round((stats.complaints.resolved / (stats.complaints.pending + stats.complaints.resolved)) * 100)
      : 0;

    const filteredStudents = safeFloorStudents.filter((s) => {
      const q = searchTerm.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.phoneNumber?.includes(q) ||
        s.branch?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q) ||
        s.roomNumber?.toString().includes(q)
      );
    });

    return (
      <div className="dash dash--warden">
        <main className="dash__main warden-main">

          {/* ══ HERO ══ */}
          <section className="w-hero">
            <div className="w-hero__bg-mesh" />
            <div className="w-hero__content">
              <div className="w-hero__left">
                <div className="w-hero__tag">
                  <span className="w-hero__tag-dot" />
                  Floor {user.floor} · Warden
                </div>
                <h1 className="w-hero__name">{greeting()}, {user.name.split(" ")[0]}</h1>
                <p className="w-hero__sub">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  &nbsp;·&nbsp; {totalStudents} residents on your floor
                </p>
              </div>
              <div className="w-hero__chips">
                <div className="w-hero__chip w-hero__chip--amber">
                  <AlertTriangle size={14} />
                  <span>{stats.complaints.pending}</span>
                  <small>Pending</small>
                </div>
                <div className="w-hero__chip w-hero__chip--green">
                  <CheckCircle size={14} />
                  <span>{countResolvedToday()}</span>
                  <small>Today</small>
                </div>
                <div className="w-hero__chip w-hero__chip--blue">
                  <KeyRound size={14} />
                  <span>{roomRequestCount}</span>
                  <small>Requests</small>
                </div>
              </div>
            </div>
          </section>

          {/* ══ ALERT BANNERS ══ */}
          {stats.complaints.pending > 0 && (
            <div className="w-alert w-alert--amber" onClick={() => navigate("/warden/complaints")}>
              <div className="w-alert__icon"><AlertCircle size={15} /></div>
              <span>
                <strong>{stats.complaints.pending} complaint{stats.complaints.pending > 1 ? "s" : ""}</strong> waiting for your review
              </span>
              <div className="w-alert__cta">Review <ArrowRight size={13} /></div>
            </div>
          )}
          {roomRequestCount > 0 && (
            <div className="w-alert w-alert--blue" onClick={() => navigate("/warden/room-requests")}>
              <div className="w-alert__icon"><KeyRound size={15} /></div>
              <span>
                <strong>{roomRequestCount} room request{roomRequestCount > 1 ? "s" : ""}</strong> pending approval
              </span>
              <div className="w-alert__cta">Approve <ArrowRight size={13} /></div>
            </div>
          )}

          {/* ══ METRIC GRID ══ */}
          <section className="w-metrics">
            <MetricCard
              label="Total Rooms"
              value={totalRooms}
              sub={`Floor ${user.floor}`}
              icon={<Building2 size={16} />}
              color="blue"
            />
            <MetricCard
              label="Occupied"
              value={occupiedRooms}
              sub={`${occupancyPct}% occupancy`}
              icon={<BedDouble size={16} />}
              color="violet"
              bar={occupancyPct}
            />
            <MetricCard
              label="Vacant"
              value={vacantRooms}
              sub="Available now"
              icon={<DoorOpen size={16} />}
              color="emerald"
            />
            <MetricCard
              label="Residents"
              value={totalStudents}
              sub="Active students"
              icon={<Users size={16} />}
              color="cyan"
            />
            <MetricCard
              label="Open Issues"
              value={stats.complaints.pending}
              sub={`${resolutionRate}% resolved`}
              icon={<AlertCircle size={16} />}
              color="amber"
              bar={resolutionRate}
              barColor="amber"
            />
            <MetricCard
              label="Room Requests"
              value={roomRequestCount}
              sub="Need approval"
              icon={<KeyRound size={16} />}
              color="rose"
            />
          </section>

          {/* ══ ANALYTICS + ACTIONS ROW ══ */}
          <div className="w-body-grid">

            {/* Occupancy Arc Panel */}
            <div className="w-panel w-panel--occupancy">
              <div className="w-panel__head">
                <span className="w-panel__title">Occupancy</span>
                <span className="w-panel__badge w-panel__badge--blue">Floor {user.floor}</span>
              </div>
              <div className="w-arc-wrap">
                <OccupancyArc pct={occupancyPct} occupied={occupiedRooms} total={totalRooms} />
              </div>
              <div className="w-occ-legend">
                <div className="w-occ-legend__item">
                  <span className="w-occ-legend__dot w-occ-legend__dot--blue" />
                  <span>Occupied <strong>{occupiedRooms}</strong></span>
                </div>
                <div className="w-occ-legend__item">
                  <span className="w-occ-legend__dot w-occ-legend__dot--muted" />
                  <span>Vacant <strong>{vacantRooms}</strong></span>
                </div>
              </div>
            </div>

            {/* Complaint Status Panel */}
            <div className="w-panel w-panel--complaints">
              <div className="w-panel__head">
                <span className="w-panel__title">Complaints</span>
                <span className="w-panel__badge w-panel__badge--amber">{stats.complaints.pending} open</span>
              </div>
              <div className="w-complaint-visual">
                <div className="w-complaint-bar-wrap">
                  <div className="w-complaint-bar-label">
                    <span>Pending</span>
                    <strong>{stats.complaints.pending}</strong>
                  </div>
                  <div className="w-complaint-track">
                    <div
                      className="w-complaint-fill w-complaint-fill--amber"
                      style={{ width: `${(stats.complaints.pending + stats.complaints.resolved) > 0 ? Math.round((stats.complaints.pending / (stats.complaints.pending + stats.complaints.resolved)) * 100) : 0}%` }}
                    />
                  </div>
                </div>
                <div className="w-complaint-bar-wrap">
                  <div className="w-complaint-bar-label">
                    <span>Resolved</span>
                    <strong>{stats.complaints.resolved}</strong>
                  </div>
                  <div className="w-complaint-track">
                    <div
                      className="w-complaint-fill w-complaint-fill--green"
                      style={{ width: `${resolutionRate}%` }}
                    />
                  </div>
                </div>
                <div className="w-complaint-bar-wrap">
                  <div className="w-complaint-bar-label">
                    <span>Resolved Today</span>
                    <strong>{countResolvedToday()}</strong>
                  </div>
                  <div className="w-complaint-track">
                    <div
                      className="w-complaint-fill w-complaint-fill--blue"
                      style={{ width: `${stats.complaints.resolved > 0 ? Math.min(100, Math.round((countResolvedToday() / stats.complaints.resolved) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="w-resolution-rate">
                <span>Resolution Rate</span>
                <strong className={resolutionRate >= 70 ? "rate--good" : resolutionRate >= 40 ? "rate--mid" : "rate--low"}>
                  {resolutionRate}%
                </strong>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="w-panel w-panel--actions">
              <div className="w-panel__head">
                <span className="w-panel__title">Quick Actions</span>
              </div>
              <div className="w-action-list">
                <button className="w-action-item w-action-item--amber" onClick={() => navigate("/warden/complaints")}>
                  <div className="w-action-item__icon"><AlertCircle size={16} /></div>
                  <div className="w-action-item__body">
                    <span>Complaints</span>
                    {stats.complaints.pending > 0 && <em>{stats.complaints.pending} pending</em>}
                  </div>
                  <ArrowRight size={14} className="w-action-item__arrow" />
                </button>
                <button className="w-action-item w-action-item--green" onClick={() => navigate("/warden/meals")}>
                  <div className="w-action-item__icon"><Utensils size={16} /></div>
                  <div className="w-action-item__body">
                    <span>Meal Management</span>
                    <em>Update today's menu</em>
                  </div>
                  <ArrowRight size={14} className="w-action-item__arrow" />
                </button>
                <button className="w-action-item w-action-item--blue" onClick={() => navigate("/warden/room-requests")}>
                  <div className="w-action-item__icon"><KeyRound size={16} /></div>
                  <div className="w-action-item__body">
                    <span>Room Requests</span>
                    {roomRequestCount > 0 && <em>{roomRequestCount} pending</em>}
                  </div>
                  <ArrowRight size={14} className="w-action-item__arrow" />
                </button>
                <button className="w-action-item w-action-item--violet" onClick={() => setStudentsOpen(v => !v)}>
                  <div className="w-action-item__icon"><Users size={16} /></div>
                  <div className="w-action-item__body">
                    <span>Student Roster</span>
                    <em>{totalStudents} on floor {user.floor}</em>
                  </div>
                  {studentsOpen ? <ChevronUp size={14} className="w-action-item__arrow" /> : <ArrowRight size={14} className="w-action-item__arrow" />}
                </button>
              </div>
            </div>
          </div>

          {/* ══ STUDENTS PANEL ══ */}
          {studentsOpen && (
            <section className="w-students-panel">
              <div className="w-students-panel__header">
                <div>
                  <h2>Students · Floor {user.floor}</h2>
                  <p>{filteredStudents.length} of {totalStudents} students{searchTerm && ` matching "${searchTerm}"`}</p>
                </div>
                <div className="w-students-panel__controls">
                  <div className="w-search">
                    <Search size={14} className="w-search__icon" />
                    <input
                      type="text"
                      placeholder="Search name, email, branch, room…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm("")}><X size={12} /></button>
                    )}
                  </div>
                  <button className="w-close-btn" onClick={() => { setStudentsOpen(false); setSearchTerm(""); }}>
                    <X size={14} /> Close
                  </button>
                </div>
              </div>

              <div className="w-table-wrap">
                <table className="w-table">
                  <thead>
                    <tr>
                      <th><span><Users size={11} /> Student</span></th>
                      <th><span><Phone size={11} /> Phone</span></th>
                      <th><span><GraduationCap size={11} /> Branch</span></th>
                      <th><span><Hash size={11} /> Room</span></th>
                      <th><span><Shield size={11} /> Status</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="w-table-empty">
                            <Users size={28} />
                            <p>{searchTerm ? `No results for "${searchTerm}"` : "No students on this floor yet"}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td>
                            <div className="w-student-cell">
                              <div className="w-avatar">{student.name?.charAt(0).toUpperCase() || "?"}</div>
                              <div>
                                <span className="w-student-name">{student.name || "—"}</span>
                                <span className="w-student-email">{student.email || "—"}</span>
                              </div>
                            </div>
                          </td>
                          <td><span className="w-mono">{student.phone || student.phoneNumber || "—"}</span></td>
                          <td><span className="w-branch-tag">{student.branch || student.department || "—"}</span></td>
                          <td><span className="w-room-tag">{student.roomNumber || "—"}</span></td>
                          <td>
                            <span className={`w-status-badge ${student.status === "active" ? "w-status-badge--green" : "w-status-badge--red"}`}>
                              {student.status === "active" ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
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
          )}
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
          {!profileStatus.loading && !profileStatus.submitted && (
            <div className="alert-banner" onClick={() => navigate("/student/profile")}>
              <AlertCircle size={15} />
              <span>Complete your profile to unlock all features.</span>
              <span className="alert-banner__cta">Complete now <ArrowUpRight size={13} /></span>
            </div>
          )}

          <section className="student-hero">
            <div className="student-hero__avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="student-hero__text">
              <p className="overline">{greeting()}</p>
              <h1>{user.name}</h1>
              <p className="subtitle">Welcome to your hostel portal. Manage everything in one place.</p>
            </div>
            <div className="student-badge"><BookOpen size={12} /> Student</div>
          </section>

          <div className="status-chips">
            <div className={`status-chip ${profileStatus.submitted ? "status-chip--green" : "status-chip--amber"}`}>
              {profileStatus.submitted ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
              Profile {profileStatus.submitted ? "Complete" : "Incomplete"}
            </div>
            <div className={`status-chip ${studentPending > 0 ? "status-chip--amber" : "status-chip--green"}`}>
              <Wrench size={13} />
              {studentPending > 0 ? `${studentPending} Complaint Pending` : "No Open Complaints"}
            </div>
            <div className="status-chip status-chip--blue">
              <Home size={13} /> Resident
            </div>
          </div>

          <section className="section">
            <h2 className="section__title">My Services</h2>
            <div className="student-grid">
              <ActionCard
                icon={<UserCheck size={22} />}
                title={profileStatus.submitted ? "Profile Submitted" : "Complete Profile"}
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
                badge={studentPending > 0 ? `${studentPending} Pending` : studentResolved > 0 ? "All Resolved" : null}
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
   WARDEN — NEW COMPONENTS
══════════════════════════════════════════════════ */

function MetricCard({ label, value, sub, icon, color, bar, barColor }) {
  return (
    <div className={`w-metric w-metric--${color}`}>
      <div className="w-metric__top">
        <div className={`w-metric__icon w-metric__icon--${color}`}>{icon}</div>
      </div>
      <div className="w-metric__value">{value}</div>
      <div className="w-metric__label">{label}</div>
      <div className="w-metric__sub">{sub}</div>
      {bar !== undefined && (
        <div className="w-metric__bar-track">
          <div
            className={`w-metric__bar-fill w-metric__bar-fill--${barColor || color}`}
            style={{ width: `${Math.min(bar, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function OccupancyArc({ pct, occupied, total }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (circ * Math.min(pct, 100)) / 100;

  return (
    <div className="w-arc">
      <svg viewBox="0 0 128 128" className="w-arc__svg">
        <circle cx="64" cy="64" r={r} className="w-arc__track" />
        <circle
          cx="64" cy="64" r={r}
          className="w-arc__fill"
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 64 64)"
        />
      </svg>
      <div className="w-arc__center">
        <span className="w-arc__pct">{pct}%</span>
        <span className="w-arc__meta">{occupied}/{total}</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SHARED COMPONENTS (unchanged)
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