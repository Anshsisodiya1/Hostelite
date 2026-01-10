import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "student" });
  const [processingUser, setProcessingUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH FILTER ================= */
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= HIGHLIGHT ================= */
  const highlight = (text) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      part.toLowerCase() === search.toLowerCase()
        ? <mark key={i}>{part}</mark>
        : part
    );
  };

  /* ================= EDIT ================= */
  const startEdit = (user) => {
    setEditingUser(user._id);
    setFormData({ name: user.name, email: user.email, role: user.role });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "student" });
  };

  const submitEdit = async (id) => {
    try {
      setProcessingUser(id);
      await API.put(`/users/${id}`, formData);
      // update state directly after successful edit
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...formData } : u))
      );
      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setProcessingUser(null);
    }
  };

  /* ================= DELETE ================= */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      setProcessingUser(id);
      await API.delete(`/users/${id}`);
      // remove deleted user from state
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error("DELETE ERROR:", err.response || err);
      alert(err.response?.data?.message || "Delete failed – check backend");
    } finally {
      setProcessingUser(null);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="admin-users-container">
      <h2>Manage Users</h2>

      {/* SEARCH */}
      <input
        type="text"
        className="search-input"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredUsers.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  {editingUser === user._id ? (
                    <input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  ) : (
                    highlight(user.name)
                  )}
                </td>

                <td>
                  {editingUser === user._id ? (
                    <input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  ) : (
                    highlight(user.email)
                  )}
                </td>

                <td>
                  {editingUser === user._id ? (
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                    >
                      <option value="student">Student</option>
                      <option value="warden">Warden</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>

                <td>
                  {user.role !== "admin" ? (
                    editingUser === user._id ? (
                      <>
                        <button onClick={() => submitEdit(user._id)}>Save</button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(user)}>Edit</button>
                        <button onClick={() => deleteUser(user._id)}>Delete</button>
                      </>
                    )
                  ) : (
                    "Admin"
                  )}

                  {processingUser === user._id && (
                    <span className="processing-text">Processing...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}