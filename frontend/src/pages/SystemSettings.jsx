import React, { useState, useEffect } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import "../styles/SystemSettings.css";

const SystemSettings = () => {
  const [view, setView] = useState("");

  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);

  const [totalRoomsInput, setTotalRoomsInput] = useState("");
  const [newFloor, setNewFloor] = useState("");

  const [startRoom, setStartRoom] = useState("");
  const [endRoom, setEndRoom] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");

  const [editingFloor, setEditingFloor] = useState(null);
  const [editValue, setEditValue] = useState("");

  const [showFloorsList, setShowFloorsList] = useState(false);
  const [selectedFloorRooms, setSelectedFloorRooms] = useState(null);

  // 2FA
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [otp, setOtp] = useState("");
  const [loading2FA, setLoading2FA] = useState(false);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (selectedFloorRooms && floors.length === 0) {
      setSelectedFloorRooms(null);
    }
  }, [floors, selectedFloorRooms]);

  const loadData = async () => {
    try {
      const [roomRes, floorRes] = await Promise.all([
        API.get("/rooms"),
        API.get("/floors"),
      ]);
      setRooms(roomRes.data || []);
      setFloors(floorRes.data || []);
    } catch {
      toast.error("Failed to load data");
    }
  };

  const isFloorExists = (num) =>
    floors.some((f) => Number(f.floorNumber) === Number(num));

  const getRoomsByFloor = (floorId) =>
    rooms.filter((room) => {
      if (!room?.floor) return false;
      const id = typeof room.floor === "object" ? room.floor?._id : room.floor;
      return String(id) === String(floorId);
    });

  // ── Rooms ────────────────────────────────────────────────────
  const handleCreateRooms = async () => {
    if (!totalRoomsInput || Number(totalRoomsInput) <= 0)
      return toast.error("Enter valid number of rooms");
    if (rooms.length > 0)
      return toast.error("Rooms already exist");
    if (!window.confirm(`Create ${totalRoomsInput} rooms?`)) return;
    try {
      await API.post("/rooms/create", { totalRooms: Number(totalRoomsInput) });
      toast.success("Rooms created");
      setTotalRoomsInput("");
      loadData();
    } catch {
      toast.error("Failed to create rooms");
    }
  };

  const handleDeleteAllRooms = async () => {
    if (!window.confirm("⚠️ Delete ALL rooms permanently?")) return;
    try {
      await API.delete("/rooms/delete-all");
      toast.success("All rooms deleted");
      setSelectedFloorRooms(null);
      loadData();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ── Floors ───────────────────────────────────────────────────
  const handleCreateFloor = async () => {
    if (!newFloor) return toast.error("Enter floor number");
    if (isFloorExists(newFloor)) return toast.error("Floor already exists");
    if (!window.confirm(`Create Floor ${newFloor}?`)) return;
    try {
      await API.post("/floors", { floorNumber: Number(newFloor) });
      toast.success("Floor created");
      setNewFloor("");
      loadData();
    } catch {
      toast.error("Failed to create floor");
    }
  };

  const handleDeleteFloor = async (id) => {
    if (!window.confirm("Delete this floor?")) return;
    try {
      await API.delete(`/floors/${id}`);
      toast.success("Floor deleted");
      setSelectedFloorRooms(null);
      loadData();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEditFloor = async (id) => {
    if (!editValue) return toast.error("Enter floor number");
    const exists = floors.some(
      (f) => Number(f.floorNumber) === Number(editValue) && f._id !== id
    );
    if (exists) return toast.error("Floor already exists");
    const floorRooms = getRoomsByFloor(id);
    const roomList = floorRooms.map((r) => r.roomNumber).join(", ");
    if (!window.confirm(`Change floor to ${editValue}?\nAffects ${floorRooms.length} rooms: ${roomList || "none"}`)) return;
    try {
      await API.put(`/floors/${id}`, { floorNumber: Number(editValue) });
      toast.success("Floor updated");
      setEditingFloor(null);
      setEditValue("");
      loadData();
    } catch {
      toast.error("Update failed");
    }
  };

  // ── 2FA ──────────────────────────────────────────────────────
  const generate2FA = async () => {
    try {
      setLoading2FA(true);
      const res = await API.get("/auth/generate-2fa");
      setQrCode(res.data.qrCode);
      toast.success("Scan QR in Google Authenticator");
    } catch {
      toast.error("Failed to generate 2FA");
    } finally {
      setLoading2FA(false);
    }
  };

  const verify2FA = async () => {
    try {
      await API.post("/auth/verify-2fa-setup", { token: otp });
      toast.success("2FA Enabled Successfully");
      setShow2FAModal(false);
      setQrCode("");
      setOtp("");
    } catch {
      toast.error("Invalid OTP");
    }
  };

  const close2FAModal = () => {
    setShow2FAModal(false);
    setQrCode("");
    setOtp("");
  };

  // ── Bulk assign ──────────────────────────────────────────────
  const handleBulkAssign = async () => {
    const start = Number(startRoom);
    const end   = Number(endRoom);
    if (!start || !end || !selectedFloor) return toast.error("Fill all fields");
    if (start > end) return toast.error("Start cannot be greater than End");
    const getRoomNumber = (roomStr) => Number(roomStr.split("-")[1]);
    const alreadyAssigned = rooms.filter((room) => {
      if (!room?.roomNumber) return false;
      const num = getRoomNumber(room.roomNumber);
      const inRange = num >= start && num <= end;
      const hasFloor = room.floor && (typeof room.floor === "object" ? room.floor._id : room.floor);
      return inRange && hasFloor;
    });
    if (alreadyAssigned.length > 0) {
      const roomList = alreadyAssigned.map((r) => r.roomNumber).join(", ");
      if (!window.confirm(`Rooms ${roomList} already assigned. Reassign to new floor?`)) {
        toast("Cancelled");
        return;
      }
    }
    try {
      await API.put("/rooms/bulk-assign-floor", { start, end, floorId: selectedFloor });
      toast.success("Rooms assigned");
      setStartRoom(""); setEndRoom(""); setSelectedFloor("");
      loadData();
    } catch {
      toast.error("Assignment failed");
    }
  };

  // ── Dashboard ────────────────────────────────────────────────
  if (!view) {
    return (
      <div className="system-settings-page">
        <div className="system-container">

          {/* 2FA Modal */}
          {show2FAModal && (
            <div className="modal-overlay" onClick={close2FAModal}>
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon">🔐</div>
                <h2>Two-Factor Authentication</h2>
                <p>Secure your admin account with Google Authenticator</p>

                {!qrCode ? (
                  <button className="btn-primary" onClick={generate2FA} disabled={loading2FA}>
                    {loading2FA ? "Generating…" : "Generate QR Code"}
                  </button>
                ) : (
                  <>
                    <p>Scan this QR code in your authenticator app</p>
                    <img src={qrCode} alt="2FA QR Code" width="180" />
                    <input
                      type="text"
                      placeholder="0  0  0  0  0  0"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                    <button className="btn-primary" onClick={verify2FA}>
                      Verify &amp; Enable 2FA
                    </button>
                  </>
                )}
                <button className="btn-ghost" onClick={close2FAModal}>Cancel</button>
              </div>
            </div>
          )}

          <button className="back-btn" onClick={() => window.history.back()}>
            Back
          </button>

          <h2>System Settings</h2>

          <div className="two-column">
            {/* 2FA Card */}
            <div className="card clickable" onClick={() => setShow2FAModal(true)}>
              <div className="card-icon security">🔐</div>
              <h3>Enable 2FA</h3>
              <p>Secure admin login with authenticator app</p>
            </div>

            {/* Room Management Card */}
            <div className="card clickable" onClick={() => setView("rooms")}>
              <div className="card-icon rooms">🏠</div>
              <h3>Room Management</h3>
              <p>Manage rooms &amp; occupancy status</p>
            </div>

            {/* Floor Management Card */}
            <div className="card clickable" onClick={() => setView("floors")}>
              <div className="card-icon floors">🏢</div>
              <h3>Floor Management</h3>
              <p>Create floors &amp; assign rooms to each</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── Room View ────────────────────────────────────────────────
  if (view === "rooms") {
    const occupied  = rooms.filter((r) => r.isOccupied).length;
    const available = rooms.length - occupied;

    return (
      <div className="system-settings-page">
        <div className="system-container">
          <button className="back-btn" onClick={() => setView("")}>Back</button>
          <h2>Room Management</h2>

          {rooms.length === 0 ? (
            <div className="card">
              <h3>Initialize Rooms</h3>
              <p style={{ marginBottom: "14px" }}>No rooms exist yet. Create your hostel room inventory.</p>
              <input
                type="number"
                placeholder="Enter total number of rooms"
                value={totalRoomsInput}
                onChange={(e) => setTotalRoomsInput(e.target.value)}
              />
              <button className="btn-primary" onClick={handleCreateRooms}>
                Create Rooms
              </button>
            </div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card total">
                  <h4>Total Rooms</h4>
                  <p>{rooms.length}</p>
                </div>
                <div className="stat-card occupied">
                  <h4>Occupied</h4>
                  <p>{occupied}</p>
                </div>
                <div className="stat-card available">
                  <h4>Available</h4>
                  <p>{available}</p>
                </div>
              </div>

              <div className="card small-card">
                <button className="btn-danger" onClick={handleDeleteAllRooms}>
                  🗑 Delete All Rooms
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Floor View ───────────────────────────────────────────────
  if (view === "floors") {
    return (
      <div className="system-settings-page">
        <div className="system-container">
          <button className="back-btn" onClick={() => setView("")}>Back</button>
          <h2>Floor Management</h2>

          <div className="flex-row">
            {/* Create floor */}
            <div className="card small-card">
              <h3>Create Floor</h3>
              <p style={{ marginBottom: "14px" }}>Add a new floor to the hostel</p>
              <input
                type="number"
                placeholder="Floor number (e.g. 1)"
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
              />
              <button className="btn-primary" onClick={handleCreateFloor}>
                Add Floor
              </button>
            </div>

            {/* Bulk assign */}
            <div className="card small-card">
              <h3>Assign Rooms to Floor</h3>
              <p style={{ marginBottom: "14px" }}>Bulk assign a room range to a floor</p>
              <input
                type="number"
                placeholder="Start room number"
                value={startRoom}
                onChange={(e) => setStartRoom(e.target.value)}
              />
              <input
                type="number"
                placeholder="End room number"
                value={endRoom}
                onChange={(e) => setEndRoom(e.target.value)}
              />
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
              >
                <option value="">Select Floor</option>
                {floors.map((f) => (
                  <option key={f._id} value={f._id}>Floor {f.floorNumber}</option>
                ))}
              </select>
              <button className="btn-primary" onClick={handleBulkAssign}>
                Assign Rooms
              </button>
            </div>
          </div>

          {/* Toggle floors list */}
          <div className="card compact-bar">
            <button className="btn-toggle" onClick={() => setShowFloorsList(!showFloorsList)}>
              {showFloorsList ? "▲ Hide Floors" : "▼ View All Floors"}
              {floors.length > 0 && (
                <span className="badge" style={{ marginLeft: "8px" }}>
                  {floors.length} floors
                </span>
              )}
            </button>
          </div>

          {/* Floor list */}
          {showFloorsList && (
            floors.length === 0 ? (
              <div className="card" style={{ marginTop: "10px" }}>
                <p>No floors added yet.</p>
              </div>
            ) : (
              <div className="floor-grid compact-grid">
                {floors.map((floor) => {
                  const floorRooms    = getRoomsByFloor(floor._id);
                  const occupiedCount = floorRooms.filter((r) => r.isOccupied).length;
                  const availableCount = floorRooms.length - occupiedCount;

                  return (
                    <div key={floor._id} className="floor-card compact-card">
                      <div className="floor-top">

                        {/* Left: name + stats */}
                        <div className="floor-top-left">
                          {editingFloor === floor._id ? (
                            <input
                              className="floor-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            <h3
                              className="clickable-floor"
                              onClick={() => {
                                setEditingFloor(floor._id);
                                setEditValue(floor.floorNumber);
                              }}
                            >
                              Floor {floor.floorNumber}
                            </h3>
                          )}

                          {/* Inline stats */}
                          {/* <div className="floor-badges">
                            <span className="badge room-count">
                              {floorRooms.length} rooms
                            </span>
                            <span className="badge occ-badge">
                              {occupiedCount} occupied
                            </span>
                            <span className="badge available-badge">
                              {availableCount} free
                            </span>
                          </div> */}
                        </div>

                        {/* Right: actions */}
                        <div className="floor-actions">
                          {editingFloor === floor._id ? (
                            <>
                              <button className="btn-primary btn-sm" onClick={() => handleEditFloor(floor._id)}>
                                Save
                              </button>
                              <button className="btn-ghost btn-sm" onClick={() => { setEditingFloor(null); setEditValue(""); }}>
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-outline btn-sm"
                                onClick={() => setSelectedFloorRooms(floorRooms)}
                              >
                                View Rooms
                              </button>
                              <button
                                className="btn-danger btn-sm"
                                onClick={() => handleDeleteFloor(floor._id)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Room chip panel */}
          {selectedFloorRooms && (
            <div className="card room-box">
              <h3>Assigned Rooms</h3>
              <div className="room-grid">
                {selectedFloorRooms.map((room) => (
                  <div
                    key={room._id}
                    className={`room-chip ${room.isOccupied ? "occupied" : ""}`}
                  >
                    {room.roomNumber}
                  </div>
                ))}
              </div>
              <button className="btn-ghost btn-sm" style={{ width: "auto" }} onClick={() => setSelectedFloorRooms(null)}>
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    );
  }

  return null;
};

export default SystemSettings;