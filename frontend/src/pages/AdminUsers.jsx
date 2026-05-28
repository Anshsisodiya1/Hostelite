import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Register from "./Register";
import { Pencil, Trash2, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import "../styles/AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [rooms, setRooms]     = useState([]);
  const [floors, setFloors]   = useState([]);
  const [profileMap, setProfileMap] = useState({});
  const [requestMap, setRequestMap] = useState({}); // studentId → latest request

  const [view, setView]         = useState("student");
  const [loading, setLoading]   = useState(true);

  const [editingUser, setEditingUser]       = useState(null);
  const [processingUser, setProcessingUser] = useState(null);

  const [search, setSearch]           = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", role: "", room: "", floor: "",
  });

  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const responses = await Promise.allSettled([
        API.get("/users"),
        API.get("/rooms"),
        API.get("/floors"),
        API.get("/profile/all"),
        API.get("/room-requests/admin/all"), // ← new
      ]);

      if (responses[0].status === "fulfilled") {
        setUsers(responses[0].value.data || []);
      }
      if (responses[1].status === "fulfilled") {
        setRooms(responses[1].value.data || []);
      }
      if (responses[2].status === "fulfilled") {
        setFloors(responses[2].value.data || []);
      }
      if (responses[3].status === "fulfilled") {
        const profiles = responses[3].value.data || [];
        const map = {};
        profiles.forEach((p) => {
          const uid = p.user?._id || p.user;
          if (uid) map[uid] = { profilePhoto: p.profilePhoto || null, fullName: p.fullName || null };
        });
        setProfileMap(map);
      }
      if (responses[4].status === "fulfilled") {
        // Build map: studentId → most recent request
        const reqs = responses[4].value.data || [];
        const map = {};
        reqs.forEach((r) => {
          const sid = r.student?._id || r.student;
          if (!sid) return;
          // keep the most recent one (array is sorted -createdAt)
          if (!map[sid]) map[sid] = r;
        });
        setRequestMap(map);
      }
    } catch (err) {
      console.error("LOAD DATA ERROR:", err);
      alert(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = (users || [])
    .filter((u) => u?.role === view)
    .filter((u) =>
      u?.name?.toLowerCase().includes(search.toLowerCase()) ||
      u?.email?.toLowerCase().includes(search.toLowerCase())
    );

  const startEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name:  user.name       || "",
      email: user.email      || "",
      role:  user.role       || "",
      room:  user.room?._id  || "",
      floor: user.floor?._id || "",
    });
  };
  const cancelEdit = () => setEditingUser(null);

  // ── Submit edit ──
  // For wardens: still direct PUT (floor assignment, no approval needed)
  // For students: if room changed → send room request; other fields → direct PUT
  const submitEdit = async (id, user) => {
    try {
      setProcessingUser(id);

      if (view === "student" && formData.room && formData.room !== (user.room?._id || "")) {
        // Room changed → send assignment request to warden
        await API.post("/room-requests", {
          studentId: id,
          roomId: formData.room,
        });
        // Also update name/email directly if changed
        const nonRoomData = { name: formData.name, email: formData.email };
        await API.put(`/users/${id}`, nonRoomData);
        alert("✅ Room assignment request sent to warden for approval!");
      } else {
        // No room change or warden tab → direct update
        await API.put(`/users/${id}`, formData);
      }

      await loadData();
      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setProcessingUser(null);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      setProcessingUser(id);
      await API.delete(`/users/${id}`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setProcessingUser(null);
    }
  };

  const cancelRequest = async (reqId) => {
    if (!window.confirm("Cancel this pending room request?")) return;
    try {
      await API.delete(`/room-requests/${reqId}`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Could not cancel request");
    }
  };

  const openProfile = async (userId) => {
    try {
      const res = await API.get(`/profile/user/${userId}`);
      navigate(`/admin/student/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Profile not found");
    }
  };

  const getInitials = (name) =>
    name ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";

  /* ── Request status pill ── */
  const RequestPill = ({ studentId }) => {
    const req = requestMap[studentId];
    if (!req) return null;

    const map = {
      pending:  { icon: <Clock size={11} />,        label: "Pending Approval", cls: "req-pill--pending"  },
      approved: { icon: <CheckCircle size={11} />,  label: "Room Approved",    cls: "req-pill--approved" },
      rejected: { icon: <XCircle size={11} />,      label: "Request Rejected", cls: "req-pill--rejected" },
    };
    const info = map[req.status] || map.pending;

    return (
      <span className={`req-pill ${info.cls}`}>
        {info.icon}
        {info.label}
        {req.status === "pending" && (
          <button
            className="req-pill__cancel"
            onClick={(e) => { e.stopPropagation(); cancelRequest(req._id); }}
            title="Cancel request"
          >
            ×
          </button>
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="au-loading">
        <div className="au-spinner"><span /><span /><span /></div>
        <p>Loading users…</p>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      <div className="users-card">

        {showAddForm ? (
          <div className="register-wrapper">
            <button className="back-btn" onClick={() => setShowAddForm(false)}>← Back</button>
            <Register />
          </div>
        ) : (
          <>
            <div className="users-header">
              <h2>User Management</h2>
              <div className="right-actions">
                <div className="toggle-btns">
                  <button className={view === "student" ? "active" : ""} onClick={() => setView("student")}>Students</button>
                  <button className={view === "warden"  ? "active" : ""} onClick={() => setView("warden")}>Wardens</button>
                </div>
                <button className="add-btn" onClick={() => setShowAddForm(true)}>+ Add User</button>
              </div>
            </div>

            <div className="toolbar">
              <input
                className="search-input"
                placeholder={`Search ${view}s…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="au-count">
                {filteredUsers.length} {view}{filteredUsers.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Info banner for student tab */}
            {view === "student" && (
              <div className="au-info-banner">
                <Send size={13} />
                <span>
                  Changing a student's room sends an approval request to their floor warden.
                  The room is only assigned after warden approval.
                </span>
              </div>
            )}

            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>{view === "student" ? "Room / Request" : "Floor"}</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="au-empty-row">No {view}s found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const prof     = profileMap[user._id] || {};
                    const photo    = prof.profilePhoto || null;
                    const initials = getInitials(user.name);

                    return (
                      <tr key={user._id} className={processingUser === user._id ? "au-row--processing" : ""}>

                        {/* Name + Avatar */}
                        <td>
                          {editingUser === user._id ? (
                            <input
                              className="au-inline-input"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          ) : (
                            <div
                              className={`au-name-cell ${user.role === "student" ? "au-name-cell--clickable" : ""}`}
                              onClick={() => user.role === "student" && openProfile(user._id)}
                              title={user.role === "student" ? "View profile" : ""}
                            >
                              <div className="au-avatar">
                                {photo
                                  ? <img src={photo} alt={user.name} className="au-avatar-img" />
                                  : <span className="au-avatar-initials">{initials}</span>
                                }
                              </div>
                              <div className="au-name-info">
                                <span className="au-name-primary">{user.name}</span>
                                {prof.fullName && prof.fullName !== user.name && (
                                  <span className="au-name-secondary">{prof.fullName}</span>
                                )}
                              </div>
                              {user.role === "student" && (
                                <svg className="au-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Email */}
                        <td>
                          {editingUser === user._id ? (
                            <input
                              className="au-inline-input"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          ) : (
                            <span className="au-email">{user.email}</span>
                          )}
                        </td>

                        {/* Role */}
                        <td>
                          <span className={`au-role-badge au-role--${user.role}`}>{user.role}</span>
                        </td>

                        {/* Room / Floor */}
                        <td>
                          {editingUser === user._id ? (
                            view === "student" ? (
                              <select
                                className="au-inline-select"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                              >
                                <option value="">Select Room</option>
                                {rooms.map((r) => (
                                  <option key={r._id} value={r._id}>{r.roomNumber}</option>
                                ))}
                              </select>
                            ) : (
                              <select
                                className="au-inline-select"
                                value={formData.floor}
                                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                              >
                                <option value="">Select Floor</option>
                                {floors.map((f) => (
                                  <option key={f._id} value={f._id}>Floor {f.floorNumber}</option>
                                ))}
                              </select>
                            )
                          ) : (
                            <div className="au-room-cell">
                              <span className="au-room">
                                {view === "student"
                                  ? user.room?.roomNumber || <span className="au-unassigned">—</span>
                                  : user.floor?.floorNumber
                                    ? `Floor ${user.floor.floorNumber}`
                                    : <span className="au-unassigned">—</span>
                                }
                              </span>
                              {/* Show request status pill for students */}
                              {view === "student" && (
                                <RequestPill studentId={user._id} />
                              )}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="action-buttons">
                          {editingUser === user._id ? (
                            <>
                              <button
                                className="au-btn au-btn--save"
                                onClick={() => submitEdit(user._id, user)}
                                disabled={processingUser === user._id}
                              >
                                {processingUser === user._id ? "Saving…" : "Save"}
                              </button>
                              <button className="au-btn au-btn--cancel" onClick={cancelEdit}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="au-btn au-btn--edit"
                                onClick={() => startEdit(user)}
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className="au-btn au-btn--delete"
                                onClick={() => deleteUser(user._id)}
                                disabled={processingUser === user._id}
                                title="Delete"
                              >
                                {processingUser === user._id ? "…" : <Trash2 size={15} />}
                              </button>
                            </>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}