import { useEffect, useState } from "react";
import API from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null); // user being edited
  const [formData, setFormData] = useState({ name: "", email: "", role: "student" });
  const [processingUser, setProcessingUser] = useState(null); // for edit/delete loading

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please log in.");
      setLoading(false);
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert(
        "Failed to fetch users: " +
          (error.response?.data?.message || error.message)
      );
      setUsers([]);
    }
    setLoading(false);
  };

  // Start editing a user
  const startEdit = (user) => {
    setEditingUser(user._id);
    setFormData({ name: user.name, email: user.email, role: user.role });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "student" });
  };

  // Submit edited user data
  const submitEdit = async (id) => {
    try {
      setProcessingUser(id);
      await API.put(`/users/${id}`, formData); // backend should handle PUT /users/:id to update name/email/role
      await fetchUsers();
      cancelEdit();
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error.message);
      alert("Failed to update user: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessingUser(null);
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setProcessingUser(id);
      await API.delete(`/users/${id}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error.message);
      alert("Failed to delete user: " + (error.response?.data?.message || error.message));
    } finally {
      setProcessingUser(null);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Manage Users</h2>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  {editingUser === user._id ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td>
                  {editingUser === user._id ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser === user._id ? (
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="student">Student</option>
                      <option value="warden">Warden</option>
                      <option value="admin">Security</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {user.role !== "admin" ? (
                    <>
                      {editingUser === user._id ? (
                        <>
                          <button
                            onClick={() => submitEdit(user._id)}
                            disabled={processingUser === user._id}
                          >
                            Save
                          </button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(user)}>Edit</button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            disabled={processingUser === user._id}
                          >
                            Delete
                          </button>
                        </>
                      )}
                      {processingUser === user._id && (
                        <span style={{ marginLeft: "10px" }}>Processing...</span>
                      )}
                    </>
                  ) : (
                    <span>Admin</span>
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
