import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Register from "./Register";
import "../styles/AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);

  const [view, setView] = useState("student");
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [processingUser, setProcessingUser] = useState(null);

  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    room: "",
    floor: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  // ================= SAFE DATA LOADING =================
  const loadData = async () => {
    try {
      setLoading(true);

      const responses = await Promise.allSettled([
        API.get("/users"),
        API.get("/rooms"),
        API.get("/floors"),
      ]);

      // USERS
      if (responses[0].status === "fulfilled") {
        setUsers(responses[0].value.data || []);
      } else {
        console.error("Users error:", responses[0].reason);
      }

      // ROOMS
      if (responses[1].status === "fulfilled") {
        setRooms(responses[1].value.data || []);
      } else {
        console.error("Rooms error:", responses[1].reason);
      }

      // FLOORS
      if (responses[2].status === "fulfilled") {
        setFloors(responses[2].value.data || []);
      } else {
        console.error("Floors error:", responses[2].reason);
      }
    } catch (err) {
      console.error("LOAD DATA ERROR:", err);
      alert(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER USERS =================
  const filteredUsers = (users || [])
    .filter((u) => u?.role === view)
    .filter((user) =>
      user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      user?.email?.toLowerCase().includes(search.toLowerCase())
    );

  // ================= EDIT =================
  const startEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      room: user.room?._id || "",
      floor: user.floor?._id || "",
    });
  };

  const cancelEdit = () => setEditingUser(null);

  const submitEdit = async (id) => {
    try {
      setProcessingUser(id);
      await API.put(`/users/${id}`, formData);
      await loadData();
      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setProcessingUser(null);
    }
  };

  // ================= DELETE =================
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

  // ================= PROFILE =================
  const openProfile = async (userId) => {
    try {
      const res = await API.get(`/profile/user/${userId}`);
      navigate(`/admin/student/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Profile not found");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-users-container">
      <div className="users-card">

        {/* REGISTER VIEW */}
        {showAddForm ? (
          <div className="register-wrapper">
            <button className="back-btn" onClick={() => setShowAddForm(false)}>
              ← Back
            </button>
            <Register />
          </div>
        ) : (
          <>
            {/* HEADER */}
            <div className="users-header">
              <h2>User Management</h2>

              <div className="right-actions">
                <div className="toggle-btns">
                  <button
                    className={view === "student" ? "active" : ""}
                    onClick={() => setView("student")}
                  >
                    Students
                  </button>

                  <button
                    className={view === "warden" ? "active" : ""}
                    onClick={() => setView("warden")}
                  >
                    Wardens
                  </button>
                </div>

                <button className="add-btn" onClick={() => setShowAddForm(true)}>
                  + Add User
                </button>
              </div>
            </div>

            {/* SEARCH */}
            <input
              className="search-input"
              placeholder={`Search ${view}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* TABLE */}
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>{view === "student" ? "Room" : "Floor"}</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>

                    {/* NAME */}
                    <td>
                      {editingUser === user._id ? (
                        <input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      ) : (
                        <span
                          className="clickable"
                          onClick={() =>
                            user.role === "student" && openProfile(user._id)
                          }
                        >
                          {user.name}
                        </span>
                      )}
                    </td>

                    {/* EMAIL */}
                    <td>
                      {editingUser === user._id ? (
                        <input
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                        />
                      ) : (
                        user.email
                      )}
                    </td>

                    <td>{user.role}</td>

                    {/* ROOM / FLOOR */}
                    <td>
                      {editingUser === user._id ? (
                        view === "student" ? (
                          <select
                            value={formData.room}
                            onChange={(e) =>
                              setFormData({ ...formData, room: e.target.value })
                            }
                          >
                            <option value="">Select Room</option>
                            {rooms.map((r) => (
                              <option key={r._id} value={r._id}>
                                {r.roomNumber}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={formData.floor}
                            onChange={(e) =>
                              setFormData({ ...formData, floor: e.target.value })
                            }
                          >
                            <option value="">Select Floor</option>
                            {floors.map((f) => (
                              <option key={f._id} value={f._id}>
                                Floor {f.floorNumber}
                              </option>
                            ))}
                          </select>
                        )
                      ) : view === "student" ? (
                        user.room?.roomNumber || "-"
                      ) : (
                        `Floor ${user.floor?.floorNumber || "-"}`
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="action-buttons">
                      {editingUser === user._id ? (
                        <>
                          <button onClick={() => submitEdit(user._id)}>
                            Save
                          </button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(user)}>
                            Edit
                          </button>
                          <button onClick={() => deleteUser(user._id)}>
                            Delete
                          </button>
                        </>
                      )}

                      {processingUser === user._id && (
                        <span>Processing...</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}