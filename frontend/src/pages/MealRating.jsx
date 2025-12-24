import { useState } from "react";
import API from "../services/api";

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
        } catch (err) {
            alert("Error submitting rating");
        }
    };

    return (
        <form onSubmit={submitRating}>
            <h2>Daily Meal Rating</h2>

            <input placeholder="Breakfast (1-5)" onChange={(e) => setBreakfast(e.target.value)} />
            <input placeholder="Lunch (1-5)" onChange={(e) => setLunch(e.target.value)} />
            <input placeholder="Dinner (1-5)" onChange={(e) => setDinner(e.target.value)} />

            <button>Submit</button>
        </form>
    );
}
