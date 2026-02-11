import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    room: "", // store room ObjectId
  });
  const [processingUser, setProcessingUser] = useState(null);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchRooms();
  }, []);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert("Failed to fetch users");
    }
  };

  // ================= FETCH ROOMS =================
  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data || []);
    } catch (err) {
      alert("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER USERS =================
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  // ================= START EDIT =================
  const startEdit = (user) => {
    setEditingUser(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      room: user.room?._id || "",
    });
  };

  // ================= CANCEL EDIT =================
  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      role: "student",
      room: "",
    });
  };

  // ================= SAVE EDIT =================
  const submitEdit = async (id) => {
    try {
      setProcessingUser(id);

      await API.put(`/users/${id}`, formData);

      await fetchUsers();
      await fetchRooms();

      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setProcessingUser(null);
    }
  };

  // ================= DELETE USER =================
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      setProcessingUser(id);
      await API.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setProcessingUser(null);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-users-container">
      <div className="users-card">
        <h2>Manage Users</h2>

        <input
          type="text"
          className="search-input"
          placeholder="Search Users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Room</th>
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
                      className="user-name"
                      onClick={() => navigate(`/admin/users/${user._id}`)}
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

                {/* ROLE */}
                <td>{user.role}</td>

                {/* ROOM ASSIGNMENT */}
                <td>
                  {editingUser === user._id &&
                  user.role === "student" ? (
                    <select
                      value={formData.room}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          room: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Room</option>

                      {rooms.map((room) => (
                        <option
                          key={room._id}
                          value={room._id}
                          disabled={
                            room.isOccupied &&
                            room._id !== formData.room
                          }
                        >
                          {room.roomNumber}
                        </option>
                      ))}
                    </select>
                  ) : (
                    user.room?.roomNumber || "-"
                  )}
                </td>

                {/* ACTIONS */}
                <td>
                  {user.role !== "admin" ? (
                    editingUser === user._id ? (
                      <>
                        <button onClick={() => submitEdit(user._id)}>
                          Save
                        </button>
                        <button onClick={cancelEdit}>
                          Cancel
                        </button>
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
                    )
                  ) : (
                    "Admin"
                  )}

                  {processingUser === user._id &&
                    " Processing..."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
