import React, { useState, useEffect } from "react";
import API from "../services/api";
import "../styles/SystemSettings.css";

const SystemSettings = () => {
  const [totalRooms, setTotalRooms] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [rooms, setRooms] = useState([]);

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
      await fetchRooms();
    } catch (error) {
      setMessage("Failed to create rooms");
    } finally {
      setLoading(false);
    }
  };

  const occupiedRooms = rooms.filter((r) => r.isOccupied).length;
  const availableRooms = rooms.filter((r) => !r.isOccupied).length;

  return (
    <div className="system-container">
      <h2 className="system-title">System Settings</h2>

      {/* CREATE ROOMS */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <label>Total Rooms in Hostel</label>
          <input
            type="number"
            value={totalRooms}
            onChange={(e) => setTotalRooms(e.target.value)}
            placeholder="Enter number of rooms"
          />

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Rooms"}
          </button>
        </form>

        {message && <p className="success-message">{message}</p>}
      </div>

      {/* ROOM STATISTICS */}
      <div className="stats-section">
        <h3 className="stats-title">Room Statistics</h3>

        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Rooms</h4>
            <p>{rooms.length}</p>
          </div>

          <div className="stat-card">
            <h4>Occupied Rooms</h4>
            <p>{occupiedRooms}</p>
          </div>

          <div className="stat-card">
            <h4>Available Rooms</h4>
            <p>{availableRooms}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;