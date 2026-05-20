import { useEffect, useState } from "react";
import API from "../services/api";
import {
  Coffee,
  Sun,
  Moon,
  Utensils,
  Clock,
  CalendarDays
} from "lucide-react";

import "../styles/Meal.css";

const MEAL_META = {
  breakfast: { label: "Breakfast", time: "7:00 – 9:30 AM", Icon: Coffee, accent: "amber" },
  lunch:     { label: "Lunch",     time: "12:30 – 2:30 PM", Icon: Sun,    accent: "blue" },
  dinner:    { label: "Dinner",    time: "7:30 – 9:30 PM",  Icon: Moon,   accent: "violet" },
};

export default function TodayMeal() {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [time, setTime] = useState(new Date());
  const [today, setToday] = useState(getTodayDate());

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  const fetchMeal = async () => {
    try {
      setLoading(true);
      const res = await API.get("/meals/today");
      setMeal(res.data);
      setError(false);
    } catch {
      setError(true);
      setMeal(null);
    } finally {
      setLoading(false);
    }
  };

  /* ── INITIAL FETCH ── */
  useEffect(() => {
    fetchMeal();
  }, []);

  /* ── CLOCK + MIDNIGHT RESET ── */
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const newDate = getTodayDate();

      if (newDate !== today) {
        setToday(newDate);
        setMeal(null);
        fetchMeal();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [today]);

  /* ── LOADING ── */
  if (loading) {
    return <div className="tm-card">Loading...</div>;
  }

  /* ── ERROR / EMPTY ── */
  if (error || !meal) {
    return (
      <div className="tm-card tm-card--empty">
        <div className="tm-empty">
          <Utensils size={22} />
          <p className="tm-empty-title">Menu not updated yet</p>
        </div>
      </div>
    );
  }

  /* ── MAIN UI ── */
  return (
    <div className="tm-card">

      {/* HEADER */}
      <div className="tm-card-header">

        <div className="tm-header-icon">
          <Utensils size={18} />
        </div>

        <div>
          <h3>Today's Menu</h3>

          {/* 🔥 SVG CLOCK + DATE */}
          <div className="tm-time-row">
            <span className="tm-time-item">
              <Clock size={14} />
              {time.toLocaleTimeString()}
            </span>

            <span className="tm-time-item">
              <CalendarDays size={14} />
              {today}
            </span>
          </div>
        </div>

        <div className="tm-live-dot" />
      </div>

      {/* MEALS */}
      <div className="tm-rows">
        {Object.entries(MEAL_META).map(([key, { label, time, Icon, accent }]) => (
          <div
            key={key}
            className={`tm-row tm-row--${accent} ${!meal[key]?.trim() ? "tm-row--empty" : ""}`}
          >
            <div className="tm-row-left">
              <div className={`tm-row-icon tm-row-icon--${accent}`}>
                <Icon size={16} />
              </div>

              <div>
                <span className="tm-row-label">{label}</span>
                <span className="tm-row-time">{time}</span>
              </div>
            </div>

            <div className="tm-row-value">
              {meal[key]?.trim() || "Not set"}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}