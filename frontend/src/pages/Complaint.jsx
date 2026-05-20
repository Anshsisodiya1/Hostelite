import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/complaint.css";
import {
  AlertTriangle, FileText, Send, CheckCircle,
  AlertCircle, Loader2, Type, ArrowLeft,
  MapPin, Building2, ChevronDown,
} from "lucide-react";

const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "green",  desc: "Minor issue, no urgency"          },
  medium: { label: "Medium", color: "amber",  desc: "Needs attention within a few days" },
  high:   { label: "High",   color: "red",    desc: "Urgent — requires immediate action" },
};

export default function Complaint() {
  const [title, setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [user, setUser]         = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [showError, setShowError]       = useState(false);
  const [touched, setTouched]           = useState({ title: false, description: false });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me");
        setUser(res.data);
      } catch { console.log("Failed to fetch user"); }
    };
    fetchUser();
  }, []);

  const isFormValid = title.trim().length >= 3 && description.trim().length >= 10;

  const titleError       = touched.title       && title.trim().length > 0 && title.trim().length < 3;
  const descriptionError = touched.description && description.trim().length > 0 && description.trim().length < 10;

  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitting(true);
    setShowError(false);
    try {
      await API.post("/complaints", {
        title,
        description,
        priority,
        room:  user?.room?._id,
        floor: user?.room?.floor?._id,
      });
      setShowSuccess(true);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setTimeout(() => navigate("/dashboard"), 2500);
    } catch (error) {
      console.error(error.response?.data);
      setShowError(true);
      setTimeout(() => setShowError(false), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomNumber  = user?.room?.roomNumber       || "Not Assigned";
  const floorNumber = user?.room?.floor?.floorNumber || "Not Assigned";
  const pc          = PRIORITY_CONFIG[priority];

  /* ── Success screen ── */
  if (showSuccess) {
    return (
      <div className="cmp-wrapper">
        <div className="cmp-success-screen">
          <div className="cmp-success-rings">
            <span /><span /><span />
          </div>
          <div className="cmp-success-icon">
            <CheckCircle size={32} strokeWidth={1.8} />
          </div>
          <h2>Complaint Submitted!</h2>
          <p>Your complaint has been logged. The warden will review and respond shortly.</p>
          <div className="cmp-success-redirect">
            <span className="cmp-success-dot" />
            Redirecting to dashboard…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cmp-wrapper">

      {/* Back */}
      <button className="cmp-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} strokeWidth={2.2} />
        Back
      </button>

      {/* Page header */}
      <div className="cmp-page-header">
        <div className="cmp-page-header-icon">
          <AlertTriangle size={20} strokeWidth={1.8} />
        </div>
        <div>
          <h1>Submit a Complaint</h1>
          <p>Describe your issue clearly so we can resolve it quickly.</p>
        </div>

        {/* Room & Floor chips */}
        <div className="cmp-location-chips">
          <div className="cmp-chip">
            <MapPin size={12} strokeWidth={2.2} />
            Room {roomNumber}
          </div>
          <div className="cmp-chip">
            <Building2 size={12} strokeWidth={2.2} />
            Floor {floorNumber}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {showError && (
        <div className="cmp-error-banner">
          <AlertCircle size={15} strokeWidth={2} />
          Failed to submit complaint. Please try again.
        </div>
      )}

      <form onSubmit={submitComplaint} className="cmp-form" noValidate>

        {/* Title */}
        <div className="cmp-form-section">
          <div className="cmp-section-title"><span>Complaint Details</span></div>

          <div className="cmp-field">
            <label className="cmp-label" htmlFor="cmp-title">
              <Type size={14} strokeWidth={2} />
              Title
              <span className="cmp-label-hint">min. 3 characters</span>
            </label>
            <input
              id="cmp-title"
              type="text"
              placeholder="e.g. Water leakage in bathroom"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, title: true }))}
              className={`cmp-input ${titleError ? "cmp-input--error" : title.trim().length >= 3 ? "cmp-input--valid" : ""}`}
            />
            {titleError && (
              <span className="cmp-field-error">
                <AlertCircle size={12} strokeWidth={2.5} />
                Title must be at least 3 characters
              </span>
            )}
          </div>

          {/* Description */}
          <div className="cmp-field">
            <label className="cmp-label" htmlFor="cmp-desc">
              <FileText size={14} strokeWidth={2} />
              Description
              <span className="cmp-label-hint">min. 10 characters</span>
            </label>
            <textarea
              id="cmp-desc"
              placeholder="Explain the issue in detail — when it started, how it affects you, and what action you expect…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, description: true }))}
              className={`cmp-textarea ${descriptionError ? "cmp-input--error" : description.trim().length >= 10 ? "cmp-input--valid" : ""}`}
              rows={5}
            />
            <div className="cmp-textarea-footer">
              {descriptionError ? (
                <span className="cmp-field-error">
                  <AlertCircle size={12} strokeWidth={2.5} />
                  Description must be at least 10 characters
                </span>
              ) : <span />}
              <span className={`cmp-char-count ${description.length < 10 ? "cmp-char-count--low" : ""}`}>
                {description.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* Priority */}
        <div className="cmp-form-section">
          <div className="cmp-section-title"><span>Priority Level</span></div>

          <div className="cmp-priority-grid">
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
              <label
                key={key}
                className={`cmp-priority-card cmp-priority-card--${cfg.color} ${priority === key ? "cmp-priority-card--selected" : ""}`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={key}
                  checked={priority === key}
                  onChange={() => setPriority(key)}
                  className="cmp-priority-radio"
                />
                <div className={`cmp-priority-dot cmp-priority-dot--${cfg.color}`} />
                <div className="cmp-priority-text">
                  <span className="cmp-priority-label">{cfg.label}</span>
                  <span className="cmp-priority-desc">{cfg.desc}</span>
                </div>
                {priority === key && (
                  <div className="cmp-priority-check">
                    <CheckCircle size={14} strokeWidth={2.5} />
                  </div>
                )}
              </label>
            ))}
          </div>

          {/* Selected priority indicator */}
          <div className={`cmp-priority-badge cmp-priority-badge--${pc.color}`}>
            <div className={`cmp-priority-dot cmp-priority-dot--${pc.color}`} />
            <span>{pc.label} priority selected — {pc.desc}</span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`cmp-submit ${!isFormValid ? "cmp-submit--disabled" : ""}`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={17} className="cmp-spinner" />
              Submitting Complaint…
            </>
          ) : (
            <>
              <Send size={17} strokeWidth={2} />
              Submit Complaint
            </>
          )}
        </button>

        {!isFormValid && (touched.title || touched.description) && (
          <p className="cmp-form-hint">
            Fill in both fields to enable submission.
          </p>
        )}

      </form>
    </div>
  );
}