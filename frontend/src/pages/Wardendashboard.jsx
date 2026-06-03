import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import axios from "axios";
import "../styles/warden.css";

import {
  Users, BedDouble, DoorOpen, Building2, AlertCircle, CheckCircle,
  KeyRound, Utensils, ArrowRight, Search, X, Calendar, Shield,
  Phone, Hash, ChevronUp, AlertTriangle, Activity, BarChart3,
  TrendingUp, Zap, Bell, MoreHorizontal, ExternalLink, Mail,
} from "lucide-react";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const fmtDate = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

export default function WardenDashboard() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  //  FIX: Extract floorNumber properly

  const floorDisplay = user?.floor?.floorNumber ?? user?.floor ?? "N/A";

  const [rooms,            setRooms]            = useState([]);
  const [floorStudents,    setFloorStudents]    = useState([]);
  const [roomRequestCount, setRoomRequestCount] = useState(0);
  const [complaints,       setComplaints]       = useState([]);
  const [stats,            setStats]            = useState({ complaints: { pending: 0, resolved: 0 } });
  const [rosterOpen,       setRosterOpen]       = useState(false);
  const [searchTerm,       setSearchTerm]       = useState("");

  // Admin contacts state
  const [adminContacts,        setAdminContacts]        = useState([]);
  const [adminContactsLoading, setAdminContactsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "warden") return;

    // Students + rooms
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5001/api/warden/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFloorStudents(res.data.students || []);
        setRooms(res.data.rooms || []);
      } catch { setFloorStudents([]); setRooms([]); }
    })();

    // Room requests
    (async () => {
      try {
        const res = await API.get("/room-requests/warden/pending-count");
        setRoomRequestCount(res.data.count || 0);
      } catch {}
    })();

    // Complaints
    (async () => {
      try {
        const res  = await API.get("/complaints");
        const data = Array.isArray(res.data) ? res.data : [];
        setComplaints(data);
        setStats({ complaints: {
          pending:  data.filter(c => c.status === "pending").length,
          resolved: data.filter(c => c.status === "resolved").length,
        }});
      } catch {}
    })();

    // Admin contacts
    (async () => {
      try {
        const res = await API.get("/users/dashboard-contacts");
        if (res.data?.admin) {
          setAdminContacts([res.data.admin]);
        } else {
          setAdminContacts([]);
        }
      } catch (error) {
        console.error("Failed to fetch admin contacts:", error);
        setAdminContacts([]);
      } finally {
        setAdminContactsLoading(false);
      }
    })();
  }, [user]);

  if (!user || user.role !== "warden") return null;

  const safe          = Array.isArray(floorStudents) ? floorStudents : [];
  const occupiedNos   = [...new Set(safe.map(s => s.roomNumber).filter(Boolean))];
  const totalRooms    = rooms?.length || 0;
  const occupiedRooms = occupiedNos.length;
  const vacantRooms   = Math.max(0, totalRooms - occupiedRooms);
  const totalStudents = safe.length;
  const occupancyPct  = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  const totalCmp      = stats.complaints.pending + stats.complaints.resolved;
  const resPct        = totalCmp > 0 ? Math.round((stats.complaints.resolved / totalCmp) * 100) : 0;

  const resolvedToday = () => {
    const t = new Date();
    return complaints.filter(c => {
      if (c.status !== "resolved") return false;
      const d = new Date(c.updatedAt || c.createdAt);
      return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
    }).length;
  };

  const filtered = safe.filter(s => {
    const q = searchTerm.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) ||
           s.phone?.includes(q) || s.phoneNumber?.includes(q) ||
           s.department?.toLowerCase().includes(q) || s.roomNumber?.toString().includes(q);
  });

  return (
    <div className="wd">

      {/* ── PAGE HEADER ── */}
      <div className="wd-page-header">
        <div className="wd-page-header__left">
          <div className="wd-page-header__breadcrumb">
            <span>HostelOS</span>
            <span className="wd-page-header__sep">/</span>
            <span className="wd-page-header__current">Dashboard</span>
          </div>
          <h1 className="wd-page-header__title">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          {/* FIX: floorDisplay instead of user.floor */}
          <p className="wd-page-header__sub">
            <Calendar size={13} />
            {fmtDate()} &nbsp;·&nbsp; Floor {floorDisplay}
          </p>
        </div>
        <div className="wd-page-header__right">
          <div className="wd-live-pill">
            <span className="wd-live-dot" />
            Live
          </div>
          <button className="wd-icon-btn" onClick={() => navigate("/warden/complaints")}>
            <Bell size={16} />
            {stats.complaints.pending > 0 && (
              <span className="wd-badge-dot">{stats.complaints.pending}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── ALERT STRIP ── */}
      {(stats.complaints.pending > 0 || roomRequestCount > 0) && (
        <div className="wd-alerts">
          {stats.complaints.pending > 0 && (
            <button className="wd-alert wd-alert--warn" onClick={() => navigate("/warden/complaints")}>
              <AlertTriangle size={14} />
              <span><strong>{stats.complaints.pending}</strong> complaint{stats.complaints.pending > 1 ? "s" : ""} need attention</span>
              <ArrowRight size={13} className="wd-alert__arrow" />
            </button>
          )}
          {roomRequestCount > 0 && (
            <button className="wd-alert wd-alert--info" onClick={() => navigate("/warden/room-requests")}>
              <KeyRound size={14} />
              <span><strong>{roomRequestCount}</strong> room request{roomRequestCount > 1 ? "s" : ""} pending</span>
              <ArrowRight size={13} className="wd-alert__arrow" />
            </button>
          )}
        </div>
      )}

      {/* ── KPI CARDS ── */}
      <div className="wd-kpi-grid">
        {/*  FIX: floorDisplay in sub */}
        <KpiCard
          label="Total Rooms"
          value={totalRooms}
          sub={`Floor ${floorDisplay}`}
          icon={<Building2 size={18} />}
          trend={null}
          color="default"
        />
        <KpiCard
          label="Occupied"
          value={occupiedRooms}
          sub={`${occupancyPct}% occupancy`}
          icon={<BedDouble size={18} />}
          trend={occupancyPct}
          color="blue"
          showBar
        />
        <KpiCard
          label="Vacant"
          value={vacantRooms}
          sub="Available now"
          icon={<DoorOpen size={18} />}
          color="default"
        />
        <KpiCard
          label="Residents"
          value={totalStudents}
          sub="Active students"
          icon={<Users size={18} />}
          color="default"
        />
        <KpiCard
          label="Open Issues"
          value={stats.complaints.pending}
          sub={`${resPct}% resolved overall`}
          icon={<AlertCircle size={18} />}
          color={stats.complaints.pending > 0 ? "amber" : "green"}
          onClick={() => navigate("/warden/complaints")}
        />
        <KpiCard
          label="Room Requests"
          value={roomRequestCount}
          sub="Awaiting approval"
          icon={<KeyRound size={18} />}
          color={roomRequestCount > 0 ? "amber" : "default"}
          onClick={() => navigate("/warden/room-requests")}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="wd-body">

        {/* LEFT COLUMN */}
        <div className="wd-col-left">

          {/* Occupancy Card */}
          <div className="wd-card">
            <div className="wd-card__hd">
              <span className="wd-card__title">Occupancy</span>
              {/*  FIX: floorDisplay */}
              <span className="wd-pill wd-pill--blue">Floor {floorDisplay}</span>
            </div>
            <div className="wd-occ-wrap">
              <OccRing pct={occupancyPct} occ={occupiedRooms} total={totalRooms} />
              <div className="wd-occ-legend">
                <LegendRow color="blue"   label="Occupied" val={occupiedRooms} />
                <LegendRow color="muted"  label="Vacant"   val={vacantRooms} />
                <LegendRow color="violet" label="Total"    val={totalRooms} />
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="wd-card">
            <div className="wd-card__hd">
              <span className="wd-card__title">Quick actions</span>
            </div>
            <div className="wd-actions">
              <ActionRow
                icon={<AlertCircle size={15} />}
                label="Complaints"
                sub={stats.complaints.pending > 0 ? `${stats.complaints.pending} pending` : "No pending"}
                badge={stats.complaints.pending > 0 ? stats.complaints.pending : null}
                badgeColor="amber"
                onClick={() => navigate("/warden/complaints")}
              />
              <ActionRow
                icon={<KeyRound size={15} />}
                label="Room Requests"
                sub={roomRequestCount > 0 ? `${roomRequestCount} pending` : "No pending"}
                badge={roomRequestCount > 0 ? roomRequestCount : null}
                badgeColor="blue"
                onClick={() => navigate("/warden/room-requests")}
              />
              <ActionRow
                icon={<Utensils size={15} />}
                label="Meal Management"
                sub="Update today's menu"
                onClick={() => navigate("/warden/meals")}
              />
              <ActionRow
                icon={<Users size={15} />}
                label="Student Roster"
                sub={`${totalStudents} students on floor ${floorDisplay}`}
                onClick={() => setRosterOpen(v => !v)}
                active={rosterOpen}
                trailing={rosterOpen ? <ChevronUp size={14} /> : <ArrowRight size={14} />}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="wd-col-right">
          <div className="wd-card wd-card--stretch">
            <div className="wd-card__hd">
              <span className="wd-card__title">Complaint overview</span>
              <button className="wd-text-btn" onClick={() => navigate("/warden/complaints")}>
                View all <ExternalLink size={12} />
              </button>
            </div>

            {/* Summary row */}
            <div className="wd-cmp-summary">
              <SummaryTile val={stats.complaints.pending}  label="Pending"  color="amber"  />
              <SummaryTile val={stats.complaints.resolved} label="Resolved" color="green"  />
              <SummaryTile val={resolvedToday()}           label="Today"    color="blue"   />
              <SummaryTile val={totalCmp}                  label="Total"    color="neutral"/>
            </div>

            {/* Resolution meter */}
            <div className="wd-resolution">
              <div className="wd-resolution__hd">
                <span>Resolution rate</span>
                <strong>{resPct}%</strong>
              </div>
              <div className="wd-resolution__track">
                <div className="wd-resolution__fill" style={{ width: `${resPct}%` }} />
              </div>
              <div className="wd-resolution__labels">
                <span>{stats.complaints.pending} open</span>
                <span>{stats.complaints.resolved} resolved</span>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="wd-bars">
              <BarRow label="Pending"        pct={totalCmp > 0 ? Math.round(stats.complaints.pending / totalCmp * 100) : 0}  color="amber"  />
              <BarRow label="Resolved"       pct={resPct}                                                                     color="green"  />
              <BarRow
                label="Resolved today"
                pct={stats.complaints.resolved > 0 ? Math.min(100, Math.round(resolvedToday() / stats.complaints.resolved * 100)) : 0}
                color="blue"
              />
            </div>

            {/* Footer */}
            <div className="wd-cmp-footer">
              <div>
                <p className="wd-cmp-footer__label">Overall resolution</p>
                <p className="wd-cmp-footer__sub">{totalCmp} total complaints tracked</p>
              </div>
              <span className={`wd-rate-chip ${resPct >= 70 ? "wd-rate-chip--good" : resPct >= 40 ? "wd-rate-chip--mid" : "wd-rate-chip--low"}`}>
                {resPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADMIN CONTACTS ── */}
      <div className="wd-admin-section">
        <div className="wd-admin-section__hd">
          <span className="wd-admin-section__title">Admin Contacts</span>
          <span className="wd-admin-section__badge">
            {adminContactsLoading ? "—" : adminContacts.length} admin{adminContacts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="wd-admin-grid">
          {adminContactsLoading ? (
            <div className="wd-admin-loading">
              <span className="wd-spinner" />
              Loading contacts…
            </div>
          ) : adminContacts.length === 0 ? (
            <div className="wd-admin-empty">No admin contacts available</div>
          ) : (
            adminContacts.map(admin => (
              <div className="wd-admin-card" key={admin._id}>
                <div className="wd-admin-avatar">
                  {admin.name?.charAt(0).toUpperCase() || "A"}
                </div>
                <div className="wd-admin-info">
                  <p className="wd-admin-name">{admin.name || "Admin"}</p>
                  <p className="wd-admin-role">Admin</p>
                  {admin.email && (
                    <p className="wd-admin-email">{admin.email}</p>
                  )}
                </div>
                {admin.email && (
                  <a
                    href={`mailto:${admin.email}`}
                    className="wd-icon-btn"
                    title={`Email ${admin.name}`}
                    style={{ textDecoration: "none" }}
                  >
                    <Mail size={14} />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── STUDENT ROSTER ── */}
      {rosterOpen && (
        <div className="wd-roster">
          <div className="wd-roster__hd">
            <div>
              {/*  FIX: floorDisplay */}
              <h2 className="wd-roster__title">Student Roster — Floor {floorDisplay}</h2>
              <p className="wd-roster__sub">
                {filtered.length} of {totalStudents} students
                {searchTerm && ` · "${searchTerm}"`}
              </p>
            </div>
            <div className="wd-roster__controls">
                <input
                  type="text"
                  placeholder="Search name, email, room…"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")}><X size={12} /></button>
                )}
              
              <button className="wd-close-btn" onClick={() => { setRosterOpen(false); setSearchTerm(""); }}>
                <X size={13} /> Close
              </button>
            </div>
          </div>

          <div className="wd-table-wrap">
            <table className="wd-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Phone</th>
                  <th>Room</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="wd-empty">
                        <Users size={32} strokeWidth={1.5} />
                        <p>{searchTerm ? `No results for "${searchTerm}"` : "No students on this floor yet"}</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div className="wd-student">
                        <div className="wd-avatar">{s.name?.charAt(0).toUpperCase() || "?"}</div>
                        <div>
                          <p className="wd-student__name">{s.name || "—"}</p>
                          <p className="wd-student__email">{s.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className="wd-mono">{s.phone || s.phoneNumber || "—"}</span></td>
                    <td><span className="wd-room-tag">{s.roomNumber || "—"}</span></td>
                    <td>
                      <span className={`wd-status-pill ${s.status === "active" ? "wd-status-pill--on" : "wd-status-pill--off"}`}>
                        <span className="wd-status-pill__dot" />
                        {s.status || "inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── SUB COMPONENTS ── */

function KpiCard({ label, value, sub, icon, color = "default", onClick, showBar, trend }) {
  return (
    <div className={`wd-kpi wd-kpi--${color} ${onClick ? "wd-kpi--click" : ""}`} onClick={onClick}>
      <div className="wd-kpi__top">
        <span className={`wd-kpi__icon wd-kpi__icon--${color}`}>{icon}</span>
        {onClick && <ArrowRight size={14} className="wd-kpi__arrow" />}
      </div>
      <p className="wd-kpi__val">{value}</p>
      <p className="wd-kpi__label">{label}</p>
      <p className="wd-kpi__sub">{sub}</p>
      {showBar && (
        <div className="wd-kpi__bar-track">
          <div className="wd-kpi__bar-fill" style={{ width: `${Math.min(trend, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

function OccRing({ pct, occ, total }) {
  const r    = 48;
  const circ = 2 * Math.PI * r;
  const off  = circ - (circ * Math.min(pct, 100)) / 100;
  return (
    <div className="wd-ring">
      <svg viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={r} className="wd-ring__bg" />
        <circle cx="56" cy="56" r={r} className="wd-ring__fg"
          strokeDasharray={circ} strokeDashoffset={off}
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div className="wd-ring__center">
        <span className="wd-ring__pct">{pct}%</span>
        <span className="wd-ring__sub">{occ}/{total}</span>
      </div>
    </div>
  );
}

function LegendRow({ color, label, val }) {
  return (
    <div className="wd-legend-row">
      <span className={`wd-legend-dot wd-legend-dot--${color}`} />
      <span className="wd-legend-label">{label}</span>
      <span className="wd-legend-val">{val}</span>
    </div>
  );
}

function ActionRow({ icon, label, sub, badge, badgeColor, onClick, active, trailing }) {
  return (
    <button className={`wd-action-row ${active ? "wd-action-row--active" : ""}`} onClick={onClick}>
      <span className="wd-action-row__icon">{icon}</span>
      <span className="wd-action-row__body">
        <span className="wd-action-row__label">{label}</span>
        <span className="wd-action-row__sub">{sub}</span>
      </span>
      {badge && <span className={`wd-num-badge wd-num-badge--${badgeColor}`}>{badge}</span>}
      <span className="wd-action-row__trailing">{trailing || <ArrowRight size={14} />}</span>
    </button>
  );
}

function SummaryTile({ val, label, color }) {
  return (
    <div className={`wd-sum-tile wd-sum-tile--${color}`}>
      <span className="wd-sum-tile__val">{val}</span>
      <span className="wd-sum-tile__label">{label}</span>
    </div>
  );
}

function BarRow({ label, pct, color }) {
  return (
    <div className="wd-bar-row">
      <span className="wd-bar-row__label">{label}</span>
      <div className="wd-bar-row__track">
        <div className={`wd-bar-row__fill wd-bar-row__fill--${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="wd-bar-row__pct">{pct}%</span>
    </div>
  );
}