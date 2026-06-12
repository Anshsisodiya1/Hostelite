import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/wardenMeals.css";
import {
  ArrowLeft, Utensils, Coffee, Sun, Moon,
  CheckCircle, AlertCircle, Save, Check, Clock,
  Mail, Pencil, RefreshCw, CalendarDays, Loader2,
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

  const [meals,      setMeals]      = useState(EMPTY_MEALS);
  const [savedMeals, setSavedMeals] = useState(null);
  const [viewMode,   setViewMode]   = useState(false);

  // NEW: loading state while fetching today's meal from backend
  const [fetching, setFetching] = useState(true);

  const [time,   setTime]   = useState(new Date());
  const [today,  setToday]  = useState(getTodayDate());
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  /* ── Fetch today's meal from backend on mount ──
     If a meal already exists for today (set by any warden),
     jump straight to view mode instead of showing the blank form.
  ── */
  const fetchTodayMeal = useCallback(async () => {
    try {
      setFetching(true);
      const res = await API.get("/meals/today");
      // Expecting: { breakfast: "...", lunch: "...", dinner: "..." }
      // or null / 404 if no meal set yet today
      if (res.data && (res.data.breakfast || res.data.lunch || res.data.dinner)) {
        setSavedMeals(res.data);
        setViewMode(true);
      } else {
        // No meal today — show the form
        setSavedMeals(null);
        setViewMode(false);
      }
    } catch (err) {
      // 404 means no meal today — show the form
      if (err.response?.status === 404) {
        setSavedMeals(null);
        setViewMode(false);
      }
      // Any other error: silently fall back to form
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchTodayMeal();
  }, [fetchTodayMeal]);

  /* ── Live clock + midnight auto-reset ── */
  useEffect(() => {
    const timer = setInterval(() => {
      const now     = new Date();
      setTime(now);
      const newDate = getTodayDate();
      if (newDate !== today) {
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
      setSavedMeals({ ...meals });
      setViewMode(true);
    } catch {
      setError("Failed to save meals. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* Edit: pre-fill form with current saved values */
const handleEdit = () => {
  setMeals({
    breakfast: savedMeals?.breakfast || "",
    lunch:     savedMeals?.lunch     || "",
    dinner:    savedMeals?.dinner    || "",
  });
  setViewMode(false);
  setError("");
};
  const filledCount = Object.values(meals).filter((v) => v.trim()).length;

  /* ── Shared header ── */
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

  /* ── Date strip ── */
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

  /* ── Full-page skeleton while fetching ── */
  if (fetching) {
    return (
      <div className="wm-root">
        <div className="wm-fetch-loader">
          <div className="wm-fetch-spinner">
            <Loader2 size={28} strokeWidth={2} />
          </div>
          <p>Loading today's meal plan…</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════
     VIEW MODE
  ════════════════════════════════════════ */
  if (viewMode && savedMeals) {
    return (
      <div className="wm-root">
        <Header />
        <DateStrip />

        <div className="wm-success-banner">
          <div className="wm-success-banner__icon">
            <Mail size={18} strokeWidth={1.8} />
          </div>
          <div>
            <div className="wm-success-banner__title">Meal plan saved &amp; students notified</div>
            <div className="wm-success-banner__sub">
              Email notifications were sent to all registered students.
            </div>
          </div>
        </div>

        <div className="wm-meals">
          {MEAL_CONFIG.map((meal, i) => {
            const { Icon, accent } = meal;
            const value = savedMeals[meal.name] || "";
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
     FORM MODE
  ════════════════════════════════════════ */
  return (
    <div className="wm-root">

      {saving && (
        <div className="wm-overlay">
          <div className="wm-overlay-card">
            <div className="wm-overlay-rings">
              <span /><span /><span />
            </div>
            <div className="wm-overlay-icon">
              <Mail size={26} strokeWidth={1.5} />
            </div>
            <h3>Saving &amp; Notifying Students</h3>
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

      {error && (
        <div className="wm-error">
          <AlertCircle size={15} strokeWidth={2} />
          {error}
        </div>
      )}

      <button
        className={`wm-save-btn ${saving ? "wm-save-btn--loading" : ""}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <>
            <span className="wm-spinner" />
            Saving &amp; Sending Emails…
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