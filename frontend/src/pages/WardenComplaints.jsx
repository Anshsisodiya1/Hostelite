import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "../styles/WardenComplaints.css"; 

export default function WardenComplaints() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await API.get("/complaints");

            const complaintsArray = Array.isArray(res.data)
                ? res.data
                : res.data.complaints || [];

            // Only show pending complaints
            setComplaints(complaintsArray.filter(c => c.status === "pending"));
            setLoading(false);
        } catch (error) {
            alert("Failed to load complaints");
            setLoading(false);
        }
    };

    const markAsResolved = async (id) => {
        try {
            setProcessingId(id);
            await API.put(`/complaints/${id}`, { status: "resolved" });

            // Remove the complaint from local state immediately
            setComplaints(prev => prev.filter(c => c._id !== id));

            setProcessingId(null);
        } catch (error) {
            alert("Failed to update status");
            setProcessingId(null);
        }
    };

    if (loading) return <h3>Loading complaints...</h3>;

    return (
        <div className="warden-container">
            <h2>Warden – Student Complaints</h2>

            {complaints.length === 0 ? (
                <p className="no-complaints">No pending complaints</p>
            ) : (
                <div className="complaints-grid">
                    {complaints.map((complaint) => (
                        <div key={complaint._id} className="complaint-card">
                            <p><b>Student:</b> {complaint.student?.name || "Unknown"}</p>
                            <p><b>Issue:</b> {complaint.title || complaint.message}</p>
                            <p><b>Status:</b> {complaint.status || "pending"}</p>

                            <button
                                className="resolve-btn"
                                disabled={processingId === complaint._id}
                                onClick={() => markAsResolved(complaint._id)}
                            >
                                {processingId === complaint._id ? "Processing..." : "Mark as Resolved"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}