import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/complaint.css";

export default function Complaint() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    const submitComplaint = async (e) => {
        e.preventDefault();
        try {
            await API.post("/complaints", { title, description });
            alert("Complaint submitted successfully");
            navigate("/dashboard");
        } catch (error) {
            alert("Failed to submit complaint");
        }
    };

    return (
        <div className="complaint-container">
            <form className="complaint-card" onSubmit={submitComplaint}>
                <h2>Submit Complaint</h2>

                <input
                    type="text"
                    placeholder="Complaint Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <textarea
                    placeholder="Describe your issue"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <button type="submit">Submit Complaint</button>
            </form>
        </div>
    );
}