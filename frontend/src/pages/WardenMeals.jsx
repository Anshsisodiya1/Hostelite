import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/wardenMeals.css";
import {
  ArrowLeft, Utensils, Coffee, Sun, Moon,
  CheckCircle, AlertCircle, Save, Check, Clock,
  Mail, Pencil, RefreshCw, CalendarDays,
} from "lucide-react";

/* ── Meal metadata ── */
const MEAL_CONFIG = [
  {
    name: "breakfast",
    label: "Breakfast",
    time: "7:00 – 9:30 AM",
    Icon: Coffee,
    placeholder: "e.g. Poha, Chai, Bread Butter",
    accent: "amber",
  },
  {
    name: "lunch",
    label: "Lunch",
    time: "12:30 – 2:30 PM",
    Icon: Sun,
    placeholder: "e.g. Dal, Rice, Sabzi, Roti",
    accent: "blue",
  },
  {
    name: "dinner",
    label: "Dinner",
    time: "7:30 – 9:30 PM",
    Icon: Moon,
    placeholder: "e.g. Paneer, Roti, Salad",
    accent: "violet",
  },
];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const EMPTY_MEALS = { breakfast: "", lunch: "", dinner: "" };

const WardenMeals = () => {
  const navigate = useNavigate();

  /* form values */
  const [meals, setMeals]           = useState(EMPTY_MEALS);
  /* what's actually saved — drives the "view" card */
  const [savedMeals, setSavedMeals] = useState(null);
  /* true = show view card, false = show form */
  const [viewMode, setViewMode]     = useState(false);

  const [time, setTime]   = useState(new Date());
  const [today, setToday] = useState(getTodayDate());
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  /* ── Live clock + midnight auto-reset ── */
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);
      const newDate = getTodayDate();
      if (newDate !== today) {
        /* New day → wipe everything, show the form again */
        setToday(newDate);
        setMeals(EMPTY_MEALS);
        setSavedMeals(null);
        setViewMode(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [today]);

  /* ── Handlers ── */
  const handleChange = (e) => {
    setMeals((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSave = async () => {
    const hasAny = Object.values(meals).some((v) => v.trim());
    if (!hasAny) {
      setError("Please fill in at least one meal before saving.");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await API.post("/meals", meals);
      /* Snapshot what was saved, switch to view mode */
      setSavedMeals({ ...meals });
      setViewMode(true);
    } catch {
      setError("Failed to save meals. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* Edit button → pre-fill form with saved values */
  const handleEdit = () => {
    setMeals({ ...savedMeals });
    setViewMode(false);
    setError("");
  };

  const filledCount = Object.values(meals).filter((v) => v.trim()).length;

  /* ── Shared header (same in both modes) ── */
  const Header = () => (
    <div className="wm-header">
      <button className="wm-back" onClick={() => navigate(-1)}>
        <ArrowLeft size={15} strokeWidth={2.2} />
        Back
      </button>

      <div className="wm-header-meta">
        <div className="wm-title-row">
          <div className="wm-icon-wrap">
            <Utensils size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h1>Meal Schedule</h1>
            <p className="wm-subtitle">
              {viewMode ? "Today's menu has been set" : "Update today's hostel menu"}
            </p>
          </div>
        </div>
      </div>

      <div className="wm-clock-badge">
        <div className="wm-clock-dot" />
        <span className="wm-time">
          {time.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </span>
      </div>
    </div>
  );

  /* ── Date strip (same in both modes) ── */
  const DateStrip = () => (
    <div className="wm-date-strip">
      <CalendarDays size={15} strokeWidth={2} className="wm-date-icon" />
      <span className="wm-date-label">Today</span>
      <span className="wm-date-value">{formatDate(today)}</span>
      {!viewMode && (
        <div className="wm-progress-wrap">
          <div className="wm-progress-label">{filledCount}/3 meals filled</div>
          <div className="wm-progress-track">
            <div
              className="wm-progress-bar"
              style={{ width: `${(filledCount / 3) * 100}%` }}
            />
          </div>
        </div>
      )}
      {viewMode && (
        <div className="wm-saved-chip">
          <CheckCircle size={12} strokeWidth={2.5} />
          Menu saved
        </div>
      )}
    </div>
  );

  /* ════════════════════════════════════════
     VIEW MODE — show what was saved
  ════════════════════════════════════════ */
  if (viewMode && savedMeals) {
    return (
      <div className="wm-root">
        <Header />
        <DateStrip />

        {/* Success banner */}
        <div className="wm-success-banner">
          <div className="wm-success-banner__icon">
            <Mail size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="wm-success-banner__title">Meal plan saved & students notified</div>
            <div className="wm-success-banner__sub">
              Email notifications were sent to all registered students.
            </div>
          </div>
        </div>

        {/* Saved meal view cards */}
        <div className="wm-meals">
          {MEAL_CONFIG.map((meal, i) => {
            const { Icon, accent } = meal;
            const value = savedMeals[meal.name];
            return (
              <div
                key={meal.name}
                className={`wm-view-card wm-view-card--${accent} ${!value.trim() ? "wm-view-card--empty" : ""}`}
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="wm-view-card__left">
                  <div className={`wm-meal-icon wm-meal-icon--${accent}`}>
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className="wm-meal-label">{meal.label}</div>
                    <div className="wm-meal-time">{meal.time}</div>
                  </div>
                </div>
                <div className="wm-view-card__value">
                  {value.trim() ? value : <span className="wm-view-card__empty">Not set</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit button */}
        <button className="wm-edit-btn" onClick={handleEdit}>
          <Pencil size={15} strokeWidth={2} />
          Edit Meal Plan
        </button>

        <p className="wm-reset-note">
          <RefreshCw size={12} strokeWidth={2} />
          This menu will reset automatically at midnight.
        </p>
      </div>
    );
  }

  /* ════════════════════════════════════════
     FORM MODE — fill / update meals
  ════════════════════════════════════════ */
  return (
    <div className="wm-root">

      {/* Full-screen overlay loader */}
      {saving && (
        <div className="wm-overlay">
          <div className="wm-overlay-card">
            <div className="wm-overlay-rings">
              <span /><span /><span />
            </div>
            <div className="wm-overlay-icon">
              <Mail size={26} strokeWidth={1.5} />
            </div>
            <h3>Saving & Notifying Students</h3>
            <p>
              Sending meal update emails to all students.
              <br />
              Please wait — this may take a moment.
            </p>
            <div className="wm-overlay-steps">
              <div className="wm-overlay-step wm-overlay-step--done">
                <Check size={12} /> Meal plan saved
              </div>
              <div className="wm-overlay-step wm-overlay-step--active">
                <span className="wm-dot-pulse" /> Sending emails…
              </div>
            </div>
          </div>
        </div>
      )}

      <Header />
      <DateStrip />

      {/* Meal input cards */}
      <div className="wm-meals">
        {MEAL_CONFIG.map((meal, i) => {
          const { Icon, accent } = meal;
          const isFilled = meals[meal.name].trim();
          return (
            <div
              key={meal.name}
              className={`wm-meal-card wm-meal-card--${accent} ${isFilled ? "wm-meal-card--filled" : ""}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="wm-meal-card-header">
                <div className={`wm-meal-icon wm-meal-icon--${accent}`}>
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="wm-meal-label">{meal.label}</div>
                  <div className="wm-meal-time">{meal.time}</div>
                </div>
                {isFilled && (
                  <div className="wm-meal-check">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
              <input
                name={meal.name}
                value={meals[meal.name]}
                placeholder={meal.placeholder}
                onChange={handleChange}
                className="wm-input"
                autoComplete="off"
                disabled={saving}
              />
            </div>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="wm-error">
          <AlertCircle size={15} strokeWidth={2} />
          {error}
        </div>
      )}

      {/* Save button */}
      <button
        className={`wm-save-btn ${saving ? "wm-save-btn--loading" : ""}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <span className="wm-spinner" />
            Saving & Sending Emails…
          </>
        ) : (
          <>
            <Save size={16} strokeWidth={2} />
            Save Meal Plan
          </>
        )}
      </button>
    </div>
  );
};

export default WardenMeals;