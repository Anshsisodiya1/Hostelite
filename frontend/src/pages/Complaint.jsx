import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/complaint.css";
import {
  AlertTriangle,
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Type,
} from "lucide-react";

export default function Complaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [user, setUser] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  // ================= FETCH USER (ROOM + FLOOR POPULATED) =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me");

        setUser(res.data);
      } catch (err) {
        console.log("Failed to fetch user");
      }
    };

    fetchUser();
  }, []);

  // ================= FORM VALIDATION =================
  const isFormValid =
    title.trim().length >= 3 && description.trim().length >= 10;

  // ================= SUBMIT COMPLAINT =================
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

        // ✅ IMPORTANT: SEND IDs (NOT NAMES)
        room: user?.room?._id,
        floor: user?.room?.floor?._id,
      });

      setShowSuccess(true);

      setTitle("");
      setDescription("");
      setPriority("medium");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error(error.response?.data);
      setShowError(true);

      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="complaint-container">
      <div className="complaint-card">

        {/* HEADER */}
        <div className="complaint-header">
          <div className="header-icon">
            <AlertTriangle size={32} />
          </div>

          <div className="header-text">
            <h2>Submit Complaint</h2>
            <p className="header-subtitle">
              Describe your issue clearly so we can resolve it quickly
            </p>

            {/* ================= ROOM & FLOOR DISPLAY ================= */}
            <div style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
              <p>
                📍 Room:{" "}
                <b>{user?.room?.roomNumber || "Not Assigned"}</b>
              </p>

              <p>
                🏢 Floor:{" "}
                <b>{user?.room?.floor?.floorNumber || "Not Assigned"}</b>
              </p>
            </div>
          </div>
        </div>

        {/* SUCCESS */}
        {showSuccess && (
          <div className="feedback-message success">
            <CheckCircle size={20} />
            <span>Complaint submitted successfully!</span>
          </div>
        )}

        {/* ERROR */}
        {showError && (
          <div className="feedback-message error">
            <AlertCircle size={20} />
            <span>Failed to submit complaint</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={submitComplaint}>

          {/* TITLE */}
          <div className="form-group">
            <label className="form-label">
              <Type size={16} />
              Complaint Title
            </label>

            <input
              type="text"
              placeholder="Eg: Water leakage"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div className="form-group">
            <label className="form-label">
              <FileText size={16} />
              Description
            </label>

            <textarea
              placeholder="Write complaint..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={5}
              required
            />
          </div>

          {/* PRIORITY */}
          <div className="form-group">
            <label className="form-label">
              <AlertTriangle size={16} />
              Priority
            </label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* SUBMIT */}
          <div className="submit-section">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`submit-btn ${!isFormValid ? "disabled" : ""}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}