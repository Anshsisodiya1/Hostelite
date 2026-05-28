import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/WardenComplaints.css";

import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Home,
  Layers,
  Check,
  X,
  Inbox,
} from "lucide-react";

export default function WardenComplaints() {
  const { user } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [tab, setTab] = useState("pending");

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
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (id) => {
    try {
      setProcessingId(id);
      await API.put(`/complaints/${id}`, { status: "resolved" });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "resolved" } : c))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const rejectComplaint = async (id) => {
    try {
      setProcessingId(id);
      await API.put(`/complaints/reject/${id}`);
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: "rejected" } : c))
      );
    } catch (error) {
      console.error(error);
      alert("Failed to reject complaint");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingComplaints = complaints.filter((c) => c.status === "pending");
  const historyComplaints = complaints.filter(
    (c) => c.status === "resolved" || c.status === "rejected"
  );
  const rejectedCount = complaints.filter((c) => c.status === "rejected").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  const activeList = tab === "pending" ? pendingComplaints : historyComplaints;

  if (loading) {
    return (
      <div className="wc-loading">
        <div className="wc-loading__spinner" />
        <p>Loading complaints…</p>
      </div>
    );
  }

  return (
    <div className="wc-page">

      {/* ── Header ── */}
      <div className="wc-header">
        <div className="wc-header__text">
          <h1>Complaints</h1>
          <p>Manage and resolve student complaints for your floor</p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="wc-stats">
        <div className="wc-stat">
          <div className="wc-stat__icon wc-stat__icon--amber">
            <Clock size={16} />
          </div>
          <div>
            <div className="wc-stat__label">Pending</div>
            <div className="wc-stat__value wc-stat__value--amber">
              {pendingComplaints.length}
            </div>
          </div>
        </div>
        <div className="wc-stat">
          <div className="wc-stat__icon wc-stat__icon--green">
            <CheckCircle size={16} />
          </div>
          <div>
            <div className="wc-stat__label">Resolved</div>
            <div className="wc-stat__value wc-stat__value--green">
              {resolvedCount}
            </div>
          </div>
        </div>
        <div className="wc-stat">
          <div className="wc-stat__icon wc-stat__icon--red">
            <XCircle size={16} />
          </div>
          <div>
            <div className="wc-stat__label">Rejected</div>
            <div className="wc-stat__value wc-stat__value--red">
              {rejectedCount}
            </div>
          </div>
        </div>
        <div className="wc-stat">
          <div className="wc-stat__icon wc-stat__icon--blue">
            <AlertCircle size={16} />
          </div>
          <div>
            <div className="wc-stat__label">Total</div>
            <div className="wc-stat__value wc-stat__value--blue">
              {complaints.length}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="wc-tabs">
        <button
          className={`wc-tab ${tab === "pending" ? "wc-tab--active" : ""}`}
          onClick={() => setTab("pending")}
        >
          <Clock size={14} />
          Pending
          {pendingComplaints.length > 0 && (
            <span className="wc-tab__count wc-tab__count--amber">
              {pendingComplaints.length}
            </span>
          )}
        </button>
        <button
          className={`wc-tab ${tab === "history" ? "wc-tab--active" : ""}`}
          onClick={() => setTab("history")}
        >
          <CheckCircle size={14} />
          History
          {historyComplaints.length > 0 && (
            <span className="wc-tab__count wc-tab__count--slate">
              {historyComplaints.length}
            </span>
          )}
        </button>
      </div>

      {/* ── List ── */}
      {activeList.length === 0 ? (
        <div className="wc-empty">
          <div className="wc-empty__icon">
            <Inbox size={32} />
          </div>
          <p className="wc-empty__title">
            {tab === "pending" ? "No pending complaints" : "No history yet"}
          </p>
          <p className="wc-empty__sub">
            {tab === "pending"
              ? "All clear — no complaints waiting for review."
              : "Resolved and rejected complaints will appear here."}
          </p>
        </div>
      ) : (
        <div className="wc-list">
          {activeList.map((c) => {
            const roomNo = c.room?.roomNumber || "—";
            const floorNo = c.floor?.floorNumber || "—";
            const priority = c.priority || "medium";
            const isProcessing = processingId === c._id;

            return (
              <div
                key={c._id}
                className={`wc-row wc-row--${priority} ${
                  c.status !== "pending" ? `wc-row--${c.status}` : ""
                }`}
              >
                {/* Left accent + priority dot */}
                <div className={`wc-row__dot wc-row__dot--${priority}`} />

                {/* Main content */}
                <div className="wc-row__body">
                  <div className="wc-row__top">
                    <span className="wc-row__title">{c.title}</span>
                    <span className={`wc-priority wc-priority--${priority}`}>
                      {priority}
                    </span>
                    {c.status !== "pending" && (
                      <span className={`wc-status wc-status--${c.status}`}>
                        {c.status === "resolved" ? (
                          <Check size={10} />
                        ) : (
                          <X size={10} />
                        )}
                        {c.status}
                      </span>
                    )}
                  </div>

                  <div className="wc-row__meta">
                    <span className="wc-meta-item">
                      <User size={12} />
                      {c.student?.name || "Unknown"}
                    </span>
                    <span className="wc-meta-sep">·</span>
                    <span className="wc-meta-item">
                      <Home size={12} />
                      Room {roomNo}
                    </span>
                    <span className="wc-meta-sep">·</span>
                    <span className="wc-meta-item">
                      <Layers size={12} />
                      Floor {floorNo}
                    </span>
                  </div>

                  {c.description && (
                    <p className="wc-row__desc">{c.description}</p>
                  )}
                </div>

                {/* Actions — only for pending */}
                {tab === "pending" && c.status === "pending" && (
                  <div className="wc-row__actions">
                    <button
                      className="wc-btn wc-btn--resolve"
                      disabled={isProcessing}
                      onClick={() => markAsResolved(c._id)}
                    >
                      {isProcessing ? (
                        <span className="wc-btn__spinner" />
                      ) : (
                        <Check size={13} />
                      )}
                      {isProcessing ? "Saving…" : "Resolve"}
                    </button>
                    <button
                      className="wc-btn wc-btn--reject"
                      disabled={isProcessing}
                      onClick={() => rejectComplaint(c._id)}
                    >
                      {isProcessing ? (
                        <span className="wc-btn__spinner" />
                      ) : (
                        <X size={13} />
                      )}
                      {isProcessing ? "Saving…" : "Reject"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}