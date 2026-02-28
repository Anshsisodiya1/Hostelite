import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/StudentMeals.css";

const StudentMeals = () => {
  const [meal, setMeal] = useState(null);
  const [time, setTime] = useState(new Date());
  const [today, setToday] = useState(getTodayDate());

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  const fetchMeal = async () => {
    try {
      const res = await API.get("/meals/today");
      setMeal(res.data);
    } catch {
      setMeal(null);
    }
  };

  // FETCH MEAL
  useEffect(() => {
    fetchMeal();
  }, []);

  // CLOCK + AUTO RESET
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const newDate = getTodayDate();
      if (newDate !== today) {
        setToday(newDate);
        setMeal(null);
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => fetchMeal(), 0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [today]);

  return (
    <div className="student-meals">
      <h2>Today's Meal</h2>

      <p className="date-time">
        ⏰ {time.toLocaleTimeString()} | 📅 {today}
      </p>

      {!meal ? (
        <p className="empty">Meal not updated yet</p>
      ) : (
        <div className="meal-list">
          <p> <span>Breakfast:</span> {meal.breakfast || "Not decided"}</p>
          <p> <span>Lunch:</span> {meal.lunch || "Not decided"}</p>
          <p><span>Dinner:</span> {meal.dinner || "Not decided"}</p>
        </div>
      )}
    </div>
  );
};

export default StudentMeals;