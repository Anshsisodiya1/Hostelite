import { useState } from "react";
import API from "../services/api";
import "../styles/mealRating.css";

export default function MealRating() {
    const [breakfast, setBreakfast] = useState("");
    const [lunch, setLunch] = useState("");
    const [dinner, setDinner] = useState("");

    const submitRating = async (e) => {
        e.preventDefault();
        try {
            await API.post("/ratings", {
                breakfast,
                lunch,
                dinner,
            });
            alert("Rating submitted");
            setBreakfast("");
            setLunch("");
            setDinner("");
        } catch (err) {
            alert("Error submitting rating");
        }
    };

    return (
        <div className="rating-container">
            <form className="rating-card" onSubmit={submitRating}>
                <h2>Daily Meal Rating</h2>

                <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Breakfast (1-5)"
                    value={breakfast}
                    onChange={(e) => setBreakfast(e.target.value)}
                    required
                />
                <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Lunch (1-5)"
                    value={lunch}
                    onChange={(e) => setLunch(e.target.value)}
                    required
                />
                <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Dinner (1-5)"
                    value={dinner}
                    onChange={(e) => setDinner(e.target.value)}
                    required
                />

                <button type="submit">Submit Rating</button>
            </form>
        </div>
    );
}