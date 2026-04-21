import { useState } from "react";
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
  Type
} from "lucide-react";

export default function Complaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium"); // ✅ NEW
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  // Form validation
  const isFormValid =
    title.trim().length >= 3 && description.trim().length >= 10;

  const submitComplaint = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setShowError(false);

    try {
      await API.post("/complaints", {
        title,
        description,
        priority, // ✅ send to backend
      });

      setShowSuccess(true);

      // Reset form
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

        {/* Header */}
        <div className="complaint-header">
          <div className="header-icon">
            <AlertTriangle size={32} />
          </div>
          <div className="header-text">
            <h2>Submit Complaint</h2>
            <p className="header-subtitle">
              Describe your issue clearly so we can resolve it quickly
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {showSuccess && (
          <div className="feedback-message success">
            <CheckCircle size={20} />
            <span>Complaint submitted successfully! Redirecting...</span>
          </div>
        )}

        {showError && (
          <div className="feedback-message error">
            <AlertCircle size={20} />
            <span>Failed to submit complaint. Please try again.</span>
          </div>
        )}

        {/* Complaint Form */}
        <form onSubmit={submitComplaint}>

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              <Type size={16} />
              Complaint Title
            </label>
            <input
              type="text"
              id="title"
              placeholder="Eg: Water leakage in room"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              maxLength={100}
              required
            />
            <div className="input-hint">
              {title.length}/100 characters
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">
              <FileText size={16} />
              Complaint Description
            </label>
            <textarea
              id="description"
              placeholder="Write your complaint here"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={6}
              maxLength={500}
              required
            />
            <div className="input-hint">
              {description.length}/500 characters
            </div>
          </div>

          {/* ✅ Priority Dropdown */}
          <div className="form-group">
            <label className="form-label">
              <AlertTriangle size={16} />
              Priority Level
            </label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="form-select"
            >
              <option value="low">Low (Minor issue)</option>
              <option value="medium">Medium (Normal issue)</option>
              <option value="high">High (Urgent issue)</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="submit-section">
            <button
              type="submit"
              className={`submit-btn ${!isFormValid ? "disabled" : ""}`}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="help-section">
          <p className="help-text">
            <strong>Need help?</strong> Contact the hostel office at{" "}
            <a href="mailto:hostel@college.edu" className="help-link">
              hostel@college.edu
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}