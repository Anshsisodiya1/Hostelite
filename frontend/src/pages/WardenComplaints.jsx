import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/WardenComplaints.css";

export default function WardenComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await API.get("/complaints");

      const complaintsArray = Array.isArray(res.data)
        ? res.data
        : res.data.complaints || [];

      // 🔥 SORT BY PRIORITY (HIGH → MEDIUM → LOW)
      const priorityOrder = { high: 3, medium: 2, low: 1 };

      const pendingComplaints = complaintsArray
        .filter((c) => c.status === "pending")
        .sort(
          (a, b) =>
            priorityOrder[b.priority || "medium"] -
            priorityOrder[a.priority || "medium"]
        );

      setComplaints(pendingComplaints);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error.response || error);
      alert(error.response?.data?.message || "Failed to fetch complaints");
      setLoading(false);
    }
  };

  const markAsResolved = async (id) => {
    try {
      setProcessingId(id);

      await API.put(`/complaints/${id}`, { status: "resolved" });

      // Remove resolved complaint instantly from UI
      setComplaints((prev) =>
        prev.filter((complaint) => complaint._id !== id)
      );

      setProcessingId(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
      setProcessingId(null);
    }
  };

  if (loading) return <h3>Loading complaints...</h3>;

  return (
    <div className="warden-container">
      <h2>Warden – Student Complaints</h2>

      {complaints.length === 0 ? (
        <p className="no-complaints">No pending complaints</p>
      ) : (
        <div className="complaints-grid">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className={`complaint-card ${complaint.priority || "medium"}`}
            >
              <p>
                <b>Student:</b> {complaint.student?.name || "Unknown"}
              </p>

              <p>
                <b>Room No:</b>{" "}
                {complaint.student?.roomNumber || "Not Assigned"}
              </p>

              <p>
                <b>Title:</b> {complaint.title}
              </p>

              <p>
                <b>Complaint:</b> {complaint.description}
              </p>

              {/* 🔥 PRIORITY BADGE */}
              <p>
                <b>Priority:</b>{" "}
                <span
                  className={`priority ${complaint.priority || "medium"}`}
                >
                  {complaint.priority || "medium"}
                </span>
              </p>

              <p>
                <b>Status:</b>{" "}
                <span className="status pending">
                  {complaint.status}
                </span>
              </p>

              <button
                className="resolve-btn"
                disabled={processingId === complaint._id}
                onClick={() => markAsResolved(complaint._id)}
              >
                {processingId === complaint._id
                  ? "Processing..."
                  : "Mark as Resolved"}
              </button>
              {/* <p><b>Priority Raw:</b> {complaint.priority}</p> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}