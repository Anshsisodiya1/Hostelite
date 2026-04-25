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

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFloorRooms && floors.length === 0) {
      setSelectedFloorRooms(null);
    }
  }, [floors]);

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

  const isFloorExists = (num) => {
    return floors.some((f) => Number(f.floorNumber) === Number(num));
  };

  const getRoomsByFloor = (floorId) => {
    return rooms.filter((room) => {
      if (!room || !room.floor) return false;

      const id = typeof room.floor === "object" ? room.floor?._id : room.floor;

      return String(id) === String(floorId);
    });
  };

  // ================= ROOM =================
  const handleCreateRooms = async () => {
    if (!totalRoomsInput || Number(totalRoomsInput) <= 0) {
      return toast.error("Enter valid number of rooms");
    }

    if (rooms.length > 0) {
      return toast.error("Rooms already exist");
    }

    if (!window.confirm(`Create ${totalRoomsInput} rooms?`)) return;

    try {
      await API.post("/rooms/create", {
        totalRooms: Number(totalRoomsInput),
      });

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

  // ================= FLOOR =================
  const handleCreateFloor = async () => {
    if (!newFloor) return toast.error("Enter floor number");

    if (isFloorExists(newFloor)) {
      return toast.error("Floor already exists");
    }

    if (!window.confirm(`Create Floor ${newFloor}?`)) return;

    try {
      await API.post("/floors", {
        floorNumber: Number(newFloor),
      });

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
      (f) => Number(f.floorNumber) === Number(editValue) && f._id !== id,
    );

    if (exists) {
      return toast.error("Floor already exists");
    }

    const floorRooms = getRoomsByFloor(id);
    const roomList = floorRooms.map((r) => r.roomNumber).join(", ");

    const confirm = window.confirm(
      `⚠️ FINAL CONFIRMATION\n\n` +
        `Change floor to: ${editValue}\n\n` +
        `This will affect ${floorRooms.length} rooms:\n` +
        `${roomList || "No rooms"}`,
    );

    if (!confirm) return;

    try {
      await API.put(`/floors/${id}`, {
        floorNumber: Number(editValue),
      });

      toast.success("Floor updated");

      setEditingFloor(null);
      setEditValue("");
      loadData();
    } catch {
      toast.error("Update failed");
    }
  };
  // ================= BULK ASSIGN =================
  const handleBulkAssign = async () => {
    const start = Number(startRoom);
    const end = Number(endRoom);

    if (!start || !end || !selectedFloor) {
      return toast.error("Fill all fields");
    }

    if (start > end) {
      return toast.error("Start cannot be greater than End");
    }

    const getRoomNumber = (roomStr) => {
      return Number(roomStr.split("-")[1]);
    };

    const alreadyAssignedRooms = rooms.filter((room) => {
      if (!room?.roomNumber) return false;

      const num = getRoomNumber(room.roomNumber);

      const isInRange = num >= start && num <= end;

      const hasFloor =
        room.floor &&
        (typeof room.floor === "object" ? room.floor._id : room.floor);

      return isInRange && hasFloor;
    });

    if (alreadyAssignedRooms.length > 0) {
      const roomList = alreadyAssignedRooms.map((r) => r.roomNumber).join(", ");

      const confirmReassign = window.confirm(
        `Rooms ${roomList} already assigned.\nReassign to new floor?`,
      );

      if (!confirmReassign) {
        toast("Cancelled");
        return;
      }
    }

    try {
      await API.put("/rooms/bulk-assign-floor", {
        start,
        end,
        floorId: selectedFloor,
      });

      toast.success("Rooms assigned");

      setStartRoom("");
      setEndRoom("");
      setSelectedFloor("");

      loadData();
    } catch {
      toast.error("Assignment failed");
    }
  };

  // ================= MAIN =================
  if (!view) {
  return (
    <div className="system-container">

      {/* BACK BUTTON */}
      <button
        onClick={() => window.history.back()}
        style={{
          marginBottom: "15px",
          padding: "8px 12px",
          cursor: "pointer",
        }}
      >
        ⬅ Back
      </button>

      <h2>System Settings</h2>

      <div className="two-column">
        <div
          className="card clickable no-underline"
          onClick={() => setView("rooms")}
        >
          <h3>Room Management</h3>
          <p>Manage rooms & occupancy</p>
        </div>

        <div
          className="card clickable no-underline"
          onClick={() => setView("floors")}
        >
          <h3>Floor Management</h3>
          <p>Create floors & assign rooms</p>
        </div>
      </div>
    </div>
  );
}

  // ================= ROOMS =================
  if (view === "rooms") {
    const occupied = rooms.filter((r) => r.isOccupied).length;
    const available = rooms.length - occupied;

    return (
      <div className="system-container">
        <button onClick={() => setView("")}>⬅ Back</button>
        <h2>Room Management</h2>

        {rooms.length === 0 ? (
          <div className="card">
            <input
              type="number"
              placeholder="Enter total rooms (e.g. 50)"
              value={totalRoomsInput}
              onChange={(e) => setTotalRoomsInput(e.target.value)}
            />
            <button onClick={handleCreateRooms}>Create Rooms</button>
          </div>
        ) : (
          <>
            {/* SAAS STATS CARDS */}
            <div className="stats-grid">
              <div className="stat-card total">
                <h4>Total</h4>
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
              <button className="delete-btn" onClick={handleDeleteAllRooms}>
                Delete All Rooms
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ================= FLOORS =================
  if (view === "floors") {
    return (
      <div className="system-container">
        <button onClick={() => setView("")}>⬅ Back</button>
        <h2>Floor Management</h2>

        {/* SIDE BY SIDE */}
        <div className="flex-row">
          <div className="card small-card">
            <h3>Create Floor</h3>
            <input
              type="number"
              placeholder="Enter floor number"
              value={newFloor}
              onChange={(e) => setNewFloor(e.target.value)}
            />
            <button onClick={handleCreateFloor}>Add Floor</button>
          </div>

          <div className="card small-card">
            <h3>Assign Rooms</h3>

            <input
              type="number"
              placeholder="Start room"
              value={startRoom}
              onChange={(e) => setStartRoom(e.target.value)}
            />

            <input
              type="number"
              placeholder="End room"
              value={endRoom}
              onChange={(e) => setEndRoom(e.target.value)}
            />

            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="">Select Floor</option>
              {floors.map((f) => (
                <option key={f._id} value={f._id}>
                  Floor {f.floorNumber}
                </option>
              ))}
            </select>

            <button onClick={handleBulkAssign}>Assign</button>
          </div>
        </div>

        {/* FLOOR LIST */}
        <div className="card compact-bar">
          <button onClick={() => setShowFloorsList(!showFloorsList)}>
            {showFloorsList ? "Hide Floors" : "See Floors"}
          </button>
        </div>

        {showFloorsList &&
          (floors.length === 0 ? (
            <div className="card">
              <p>No floors added</p>
            </div>
          ) : (
            <div className="floor-grid compact-grid">
              {floors.map((floor) => {
                const floorRooms = getRoomsByFloor(floor._id);
                const occupiedRooms = floorRooms.filter(
                  (r) => r.isOccupied,
                ).length;
                const availableRooms = floorRooms.length - occupiedRooms;

                return (
                  <div key={floor._id} className="floor-card compact-card">
                    {/* ================= FLOOR NAME ================= */}
                    <div className="floor-top">
                      {/* INLINE EDIT MODE */}
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
                            const roomList = floorRooms
                              .map((r) => r.roomNumber)
                              .join(", ");

                            const confirm = window.confirm(
                              `⚠️ You are about to edit Floor ${floor.floorNumber}\n\n` +
                                `This floor has ${floorRooms.length} rooms:\n` +
                                `${roomList || "No rooms assigned"}\n\n` +
                                `Do you want to continue?`,
                            );

                            if (!confirm) return;

                            setEditingFloor(floor._id);
                            setEditValue(floor.floorNumber);
                          }}
                        >
                          Floor {floor.floorNumber}
                        </h3>
                      )}

                      <span>{floorRooms.length} rooms</span>
                      <span>Available: {availableRooms}</span>
                    </div>

                    {/* ================= ACTIONS ================= */}
                    <div className="floor-actions">
                      {editingFloor === floor._id ? (
                        <>
                          <button onClick={() => handleEditFloor(floor._id)}>
                            Save
                          </button>

                          <button
                            onClick={() => {
                              setEditingFloor(null);
                              setEditValue("");
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleDeleteFloor(floor._id)}>
                            Delete
                          </button>

                          <button
                            onClick={() => setSelectedFloorRooms(floorRooms)}
                          >
                            View
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {selectedFloorRooms && (
          <div className="card room-box">
            <h3>Rooms</h3>
            <div className="room-grid">
              {selectedFloorRooms.map((room) => (
                <div key={room._id} className="room-chip">
                  {room.roomNumber}
                </div>
              ))}
            </div>
            <button onClick={() => setSelectedFloorRooms(null)}>Close</button>
          </div>
        )}
      </div>
    );
  }
};

export default SystemSettings;
