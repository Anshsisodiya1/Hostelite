import React, { useState, useEffect } from "react";
import API from "../services/api";

const SystemSettings = () => {
  const [totalRooms, setTotalRooms] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]);

  // 🔹 Fetch all rooms when page loads
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await API.get("/rooms");
      setRooms(res.data);
    } catch (error) {
      console.error("Failed to fetch rooms");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!totalRooms) {
      return alert("Please enter number of rooms");
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await API.post("/rooms/create", {
        totalRooms: Number(totalRooms),
      });

      setMessage(res.data.message);
      setTotalRooms("");

      // 🔥 Refresh rooms after creation
      await fetchRooms();
    } catch (error) {
      console.error(error);
      setMessage("Failed to create rooms");
    } finally {
      setLoading(false);
    }
  };

  const occupiedRooms = rooms.filter((r) => r.isOccupied).length;
  const availableRooms = rooms.filter((r) => !r.isOccupied).length;

  return (
    <div style={{ padding: "40px" }}>
      <h2>System Settings</h2>

      {/* ================= CREATE ROOMS ================= */}
      <form onSubmit={handleSubmit}>
        <label>Total Rooms in Hostel:</label>
        <br />
        <input
          type="number"
          value={totalRooms}
          onChange={(e) => setTotalRooms(e.target.value)}
          placeholder="Enter number of rooms"
        />
        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Rooms"}
        </button>
      </form>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}

      <hr style={{ margin: "30px 0" }} />

      {/* ================= ROOM STATISTICS ================= */}
      <h3>Room Statistics</h3>

      <div style={{ marginTop: "20px" }}>
        <p><strong>Total Rooms:</strong> {rooms.length}</p>
        <p><strong>Occupied Rooms:</strong> {occupiedRooms}</p>
        <p><strong>Available Rooms:</strong> {availableRooms}</p>
      </div>
    </div>
  );
};

export default SystemSettings;
