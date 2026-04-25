import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/WardenComplaints.css";

export default function WardenComplaints() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [tab, setTab] = useState("pending"); // 🔥 NEW

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.complaints || [];

      setComplaints(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoading(false);
    }
  };

  const markAsResolved = async (id) => {
    try {
      setProcessingId(id);

      await API.put(`/complaints/${id}`, {
        status: "resolved",
      });

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, status: "resolved" } : c
        )
      );

      setProcessingId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
      setProcessingId(null);
    }
  };

  if (loading) return <h3>Loading complaints...</h3>;

  // ================= FILTER LOGIC =================
  const pendingComplaints = complaints.filter(
    (c) => c.status === "pending"
  );

  const historyComplaints = complaints.filter(
    (c) => c.status === "resolved"
  );

  const activeList =
    tab === "pending" ? pendingComplaints : historyComplaints;

  return (
    <div className="warden-container">
      <h2>Warden Dashboard</h2>

      {/* ================= TABS ================= */}
      <div className="tabs">
        <button
          className={tab === "pending" ? "active" : ""}
          onClick={() => setTab("pending")}
        >
          Pending ({pendingComplaints.length})
        </button>

        <button
          className={tab === "history" ? "active" : ""}
          onClick={() => setTab("history")}
        >
          Complaint History ({historyComplaints.length})
        </button>
      </div>

      {/* ================= LIST ================= */}
      {activeList.length === 0 ? (
        <p className="no-complaints">No complaints found</p>
      ) : (
        <div className="complaints-grid">
          {activeList.map((c) => {
            const roomNo = c.room?.roomNumber || "Not Assigned";
            const floorNo = c.floor?.floorNumber || "Not Assigned";

            return (
              <div
                key={c._id}
                className={`complaint-card ${c.priority || "medium"}`}
              >
                <p>
                  <b>Student:</b> {c.student?.name || "Unknown"}
                </p>

                <p>
                  <b>Room No:</b> {roomNo}
                </p>

                <p>
                  <b>Floor No:</b> {floorNo}
                </p>

                <p>
                  <b>Title:</b> {c.title}
                </p>

                <p>
                  <b>Complaint:</b> {c.description}
                </p>

                <p>
                  <b>Priority:</b>{" "}
                  <span className={`priority ${c.priority}`}>
                    {c.priority}
                  </span>
                </p>

                <p>
                  <b>Status:</b> {c.status}
                </p>

                {/* ================= BUTTON ONLY FOR PENDING ================= */}
                {tab === "pending" && (
                  <button
                    className="resolve-btn"
                    disabled={processingId === c._id}
                    onClick={() => markAsResolved(c._id)}
                  >
                    {processingId === c._id
                      ? "Processing..."
                      : "Mark as Resolved"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}