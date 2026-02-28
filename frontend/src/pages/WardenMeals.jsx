import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/wardenMeals.css";

const WardenMeals = () => {
  const navigate = useNavigate();

  const [meals, setMeals] = useState({
    breakfast: "",
    lunch: "",
    dinner: "",
  });

  const [time, setTime] = useState(new Date());
  const [today, setToday] = useState(getTodayDate());

  function getTodayDate() {
    return new Date().toISOString().split("T")[0];
  }

  // LIVE CLOCK + AUTO RESET
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now);

      const newDate = getTodayDate();
      if (newDate !== today) {
        setToday(newDate);
        setMeals({ breakfast: "", lunch: "", dinner: "" });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [today]);

  const handleChange = (e) => {
    setMeals({ ...meals, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await API.post("/meals", meals);
      alert(res.data.message);
    } catch (err) {
      alert("Failed to update meal");
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <div className="warden-meals">
      {/* Back Button */}
      <button className="back-btn" onClick={handleBack}>
        ← Back
      </button>

      <h2>Update Today's Meal</h2>

      <p className="date-time">
         {time.toLocaleTimeString()} |  {today}
      </p>

      <input
        name="breakfast"
        value={meals.breakfast}
        placeholder="Breakfast"
        onChange={handleChange}
      />

      <input
        name="lunch"
        value={meals.lunch}
        placeholder="Lunch"
        onChange={handleChange}
      />

      <input
        name="dinner"
        value={meals.dinner}
        placeholder="Dinner"
        onChange={handleChange}
      />

      <button onClick={handleSave}>
        Save Meal
      </button>
    </div>
  );
};

export default WardenMeals;
