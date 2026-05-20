import { useState } from "react";
import API from "../services/api";
import "../styles/ReportCard.css";

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const Icons = {
  Student: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Complaint: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Staff: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  Room: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Download: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Calendar: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.8}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Spinner: () => (
    <svg
      className="rc-spinner"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2.5}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ── Report definitions — endpoints match backend routes/reports.js exactly ───
//    Backend:  GET /api/reports/students
//              GET /api/reports/complaints
//              GET /api/reports/staff
//              GET /api/reports/rooms
//    API base URL already includes /api, so endpoints below start after that.
const REPORTS = [
  {
    id: "student",
    label: "Student / Occupancy",
    description: "Students, rooms & floor overview",
    icon: Icons.Student,
    color: "blue",
    endpoint: "/reports/students", // → GET /api/reports/students
    badge: "Students",
  },
  {
    id: "complaints",
    label: "Complaints",
    description: "Pending, resolved & priority stats",
    icon: Icons.Complaint,
    color: "amber",
    endpoint: "/reports/complaints", // → GET /api/reports/complaints
    badge: "Complaints",
  },
  {
    id: "staff",
    label: "Warden / Staff",
    description: "Staff roster & floor mapping",
    icon: Icons.Staff,
    color: "green",
    endpoint: "/reports/staff", // → GET /api/reports/staff
    badge: "Wardens",
  },
  {
    id: "rooms",
    label: "Room Allocation",
    description: "Rooms, students & vacancy stats",
    icon: Icons.Room,
    color: "violet",
    endpoint: "/reports/rooms", // → GET /api/reports/rooms
    badge: "Rooms",
  },
];

// Default date range — last 30 days
const today = new Date().toISOString().split("T")[0];
const prior = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ReportCard() {
  const [selected, setSelected] = useState(null);
  const [startDate, setStartDate] = useState(prior);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null); // { msg, type }

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  // ── Quick-select presets ────────────────────────────────────────────────────
  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 86400000);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  // ── Generate & download PDF ─────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!selected)
      return showToast("Please select a report type first.", "error");
    if (!startDate || !endDate)
      return showToast("Please set a valid date range.", "error");
    if (startDate > endDate)
      return showToast("Start date must be before end date.", "error");

    const report = REPORTS.find((r) => r.id === selected);

    try {
      setLoading(true);

      // API call — responseType blob because backend pipes a PDF binary
      const response = await API.get(report.endpoint, {
        params: { startDate, endDate },
        responseType: "blob",
      });

      // Create a temporary <a> and trigger download
      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute(
        "download",
        `${report.id}-report-${startDate}-to-${endDate}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      showToast(`✓ ${report.label} report downloaded!`, "success");
    } catch (err) {
      // If backend returned JSON error inside a blob, parse it
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          const json = JSON.parse(text);
          showToast(json.message || "Failed to generate report.", "error");
        } catch {
          showToast("Failed to generate report.", "error");
        }
      } else {
        showToast(
          err.response?.data?.message || "Failed to generate report.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedReport = REPORTS.find((r) => r.id === selected);

  return (
    <div className="rc-page">
      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`rc-toast rc-toast--${toast.type}`}>{toast.msg}</div>
      )}

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="rc-header">
        <div>
          <h1 className="rc-title">Hostel Reports</h1>
          <p className="rc-subtitle">
            Select a report type, set a date range, and download as PDF
          </p>
        </div>
        <div className="rc-header-badge">Admin Only</div>
      </div>

      {/* ── Step 1 — Report Type ────────────────────────────────────────────── */}
      <div className="rc-step-label">
        <span className="rc-step-num">1</span>
        Select Report Type
      </div>

      <div className="rc-grid">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          const isActive = selected === r.id;
          return (
            <button
              key={r.id}
              className={`rc-card rc-card--${r.color} ${isActive ? "rc-card--active" : ""}`}
              onClick={() => setSelected(r.id)}
            >
              <div className="rc-card-icon">
                <Icon />
              </div>
              <div className="rc-card-body">
                <span className="rc-card-label">{r.label}</span>
                <span className="rc-card-desc">{r.description}</span>
              </div>
              <div
                className={`rc-card-check ${isActive ? "rc-card-check--visible" : ""}`}
              >
                <Icons.Check />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Step 2 — Date Range ─────────────────────────────────────────────── */}
      <div className="rc-step-label">
        <span className="rc-step-num">2</span>
        Set Date Range
      </div>

      {/* Quick presets */}
      <div className="rc-presets">
        {[
          { label: "Last 7 days", days: 7 },
          { label: "Last 30 days", days: 30 },
          { label: "Last 90 days", days: 90 },
          { label: "Last 1 year", days: 365 },
        ].map((p) => (
          <button
            key={p.days}
            className="rc-preset-btn"
            onClick={() => applyPreset(p.days)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="rc-date-row">
        <div className="rc-date-field">
          <label className="rc-date-label">
            <span className="rc-date-icon">
              <Icons.Calendar />
            </span>
            From
          </label>
          <input
            className="rc-date-input"
            type="date"
            value={startDate}
            max={today}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="rc-date-divider">→</div>

        <div className="rc-date-field">
          <label className="rc-date-label">
            <span className="rc-date-icon">
              <Icons.Calendar />
            </span>
            To
          </label>
          <input
            className="rc-date-input"
            type="date"
            value={endDate}
            max={today}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* ── Step 3 — Generate ───────────────────────────────────────────────── */}
      <div className="rc-step-label">
        <span className="rc-step-num">3</span>
        Generate &amp; Download
      </div>

      {/* Preview pill */}
      {selectedReport && (
        <div className={`rc-preview rc-preview--${selectedReport.color}`}>
          <span className="rc-preview-icon">
            <selectedReport.icon />
          </span>
          <span>
            <strong>{selectedReport.label}</strong> report &nbsp;·&nbsp;
            {startDate} → {endDate}
          </span>
        </div>
      )}

      <button
        className={`rc-generate-btn ${loading ? "rc-generate-btn--loading" : ""} ${!selected ? "rc-generate-btn--disabled" : ""}`}
        onClick={handleGenerate}
        disabled={loading || !selected}
      >
        {loading ? (
          <>
            <Icons.Spinner />
            Generating PDF…
          </>
        ) : (
          <>
            <Icons.Download />
            Generate &amp; Download PDF
          </>
        )}
      </button>

      {!selected && (
        <p className="rc-hint">
          ← Select a report type above to enable download
        </p>
      )}
    </div>
  );
}
