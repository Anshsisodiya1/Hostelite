import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function WardenComplaints() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await API.get("/complaints");
            
            // safely get array from response
            const complaintsArray = Array.isArray(res.data) 
                ? res.data 
                : res.data.complaints || [];

            setComplaints(complaintsArray);
            setLoading(false);
        } catch (error) {
            alert("Failed to load complaints");
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/complaints/${id}`, { status });
            fetchComplaints(); // refresh list after update
        } catch (error) {
            alert("Failed to update status");
        }
    };

    if (loading) return <h3>Loading complaints...</h3>;

    return (
        <div>
            <h2>Warden – Student Complaints</h2>

            {complaints.length === 0 ? (
                <p>No complaints found</p>
            ) : (
                complaints.map((complaint) => (
                    <div key={complaint._id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                        <p><b>Student:</b> {complaint.student?.name || "Unknown"}</p>
                        <p><b>Issue:</b> {complaint.title || complaint.message}</p>
                        <p><b>Status:</b> {complaint.status || "pending"}</p>

                        {complaint.status === "pending" && (
                            <button onClick={() => updateStatus(complaint._id, "resolved")}>
                                Mark as Resolved
                            </button>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}
