import { useEffect, useState } from "react";
import API from "../services/api";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  BedDouble,
  Building2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Phone,
} from "lucide-react";
import "../styles/WardenRoomRequests.css";

const STATUS_TABS = ["pending", "approved", "rejected"];

export default function WardenRoomRequests() {
  const [requests, setRequests]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("pending");
  const [processingId, setProcessingId] = useState(null);

  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectNote, setRejectNote]     = useState("");
  const [expandedId, setExpandedId]     = useState(null);

  useEffect(() => { fetchRequests(); }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/room-requests/warden?status=${activeTab}`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchRequests error:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await API.patch(`/room-requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectModal(id);
    setRejectNote("");
  };

  const handleReject = async () => {
    try {
      setProcessingId(rejectModal);
      await API.patch(`/room-requests/${rejectModal}/reject`, {
        wardenNote: rejectNote,
      });
      setRejectModal(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Rejection failed");
    } finally {
      setProcessingId(null);
    }
  };

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="wrr-page">

      {/* ── Header ── */}
      <div className="wrr-header">
        <div className="wrr-header__left">
          <h1 className="wrr-title">Room Assignment Requests</h1>
          <p className="wrr-subtitle">
            Review and approve student room assignments for your floor
          </p>
        </div>
        <button className="wrr-refresh-btn" onClick={fetchRequests} title="Refresh">
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* ── Tab Bar ── */}
      <div className="wrr-tabs">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            className={`wrr-tab ${activeTab === tab ? "wrr-tab--active" : ""} wrr-tab--${tab}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "pending"  && <Clock size={13} />}
            {tab === "approved" && <CheckCircle size={13} />}
            {tab === "rejected" && <XCircle size={13} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === "pending" && pendingCount > 0 && (
              <span className="wrr-tab__badge">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="wrr-loading">
          <div className="wrr-spinner"><span /><span /><span /></div>
          <p>Loading requests…</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="wrr-empty">
          <div className="wrr-empty__icon">
            {activeTab === "pending"  && <Clock size={40} />}
            {activeTab === "approved" && <CheckCircle size={40} />}
            {activeTab === "rejected" && <XCircle size={40} />}
          </div>
          <p className="wrr-empty__title">No {activeTab} requests</p>
          <p className="wrr-empty__sub">
            {activeTab === "pending"
              ? "All caught up! No room requests waiting for your review."
              : `No ${activeTab} requests to show.`}
          </p>
        </div>
      ) : (
        <div className="wrr-list">
          {requests.map((req) => {
            const isExpanded   = expandedId === req._id;
            const isProcessing = processingId === req._id;
            const phone        = req.student?.phone || null;

            return (
              <div
                key={req._id}
                className={`wrr-card wrr-card--${req.status} ${isExpanded ? "wrr-card--expanded" : ""}`}
              >
                {/* ── Card Main Row ── */}
                <div className="wrr-card__main">

                  {/* Student Info */}
                  <div className="wrr-card__student">
                    <div className="wrr-avatar">
                      {req.student?.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="wrr-card__student-info">
                      <span className="wrr-card__name">
                        {req.student?.name || "—"}
                      </span>
                      <span className="wrr-card__email">
                        {req.student?.email || "—"}
                      </span>
                      {/* ── Phone always visible on card ── */}
                      <span className="wrr-card__phone">
                        <Phone size={10} />
                        {phone || "No phone on profile"}
                      </span>
                    </div>
                  </div>

                  {/* Room + Floor */}
                  <div className="wrr-card__meta">
                    <span className="wrr-meta-pill wrr-meta-pill--blue">
                      <BedDouble size={12} />
                      Room {req.room?.roomNumber || "—"}
                    </span>
                    <span className="wrr-meta-pill wrr-meta-pill--violet">
                      <Building2 size={12} />
                      Floor {req.floor?.floorNumber || "—"}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="wrr-card__status">
                    <span className={`wrr-status-badge wrr-status-badge--${req.status}`}>
                      {req.status === "pending"  && <Clock size={11} />}
                      {req.status === "approved" && <CheckCircle size={11} />}
                      {req.status === "rejected" && <XCircle size={11} />}
                      {req.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="wrr-card__actions">
                    {req.status === "pending" && (
                      <>
                        <button
                          className="wrr-btn wrr-btn--approve"
                          onClick={() => handleApprove(req._id)}
                          disabled={isProcessing}
                        >
                          {isProcessing
                            ? <span className="wrr-btn-loading" />
                            : <CheckCircle size={14} />}
                          {isProcessing ? "Processing…" : "Approve"}
                        </button>
                        <button
                          className="wrr-btn wrr-btn--reject"
                          onClick={() => openRejectModal(req._id)}
                          disabled={isProcessing}
                        >
                          <XCircle size={14} />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      className="wrr-btn wrr-btn--expand"
                      onClick={() => toggleExpand(req._id)}
                      title={isExpanded ? "Collapse" : "Details"}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* ── Expanded Detail Row ── */}
                {isExpanded && (
                  <div className="wrr-card__detail">
                    <div className="wrr-detail-grid">
                      <div className="wrr-detail-item">
                        <span className="wrr-detail-label">Requested By</span>
                        <span className="wrr-detail-value">
                          <User size={12} />
                          {req.requestedBy?.name || "Admin"}
                        </span>
                      </div>
                      <div className="wrr-detail-item">
                        <span className="wrr-detail-label">Requested On</span>
                        <span className="wrr-detail-value">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="wrr-detail-item">
                        <span className="wrr-detail-label">Student Phone</span>
                        <span className="wrr-detail-value">
                          <Phone size={12} />
                          {phone || "—"}
                        </span>
                      </div>
                      <div className="wrr-detail-item">
                        <span className="wrr-detail-label">Student Email</span>
                        <span className="wrr-detail-value">
                          {req.student?.email || "—"}
                        </span>
                      </div>
                      {req.wardenNote && (
                        <div className="wrr-detail-item wrr-detail-item--full">
                          <span className="wrr-detail-label">Warden Note</span>
                          <span className="wrr-detail-value wrr-detail-value--note">
                            {req.wardenNote}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Reject Modal ── */}
      {rejectModal && (
        <div className="wrr-overlay" onClick={() => setRejectModal(null)}>
          <div className="wrr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wrr-modal__header">
              <AlertCircle size={20} className="wrr-modal__icon" />
              <h2>Reject Room Request</h2>
            </div>
            <p className="wrr-modal__desc">
              Optionally add a reason. The admin will be notified.
            </p>
            <textarea
              className="wrr-modal__textarea"
              placeholder="Reason for rejection (optional)…"
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <div className="wrr-modal__footer">
              <button
                className="wrr-btn wrr-btn--cancel-modal"
                onClick={() => setRejectModal(null)}
              >
                Cancel
              </button>
              <button
                className="wrr-btn wrr-btn--confirm-reject"
                onClick={handleReject}
                disabled={processingId === rejectModal}
              >
                {processingId === rejectModal ? "Rejecting…" : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}