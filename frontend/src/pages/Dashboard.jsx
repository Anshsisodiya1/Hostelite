import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Dashboard() {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [user, loading, navigate]);

    if (loading) return <h3>Loading...</h3>;

    return (
        <div>
            <h1>Dashboard</h1>
            <h3>Welcome, {user?.name}</h3>
            <p>Role: {user?.role}</p>

            <hr />

            {/* STUDENT DASHBOARD */}
            {user?.role === "student" && (
                <>
                    <h2>Student Panel</h2>

                    <button onClick={() => navigate("/complaints")}>
                        Submit Complaint
                    </button>

                    <button onClick={() => navigate("/ratings")}>
                        Daily Meal Rating
                    </button>

                    {/* NEW PAYMENT BUTTON */}
                    <button
                        style={{ marginTop: "10px" }}
                        onClick={() => navigate("/payments")}
                    >
                        Pay Hostel Fees
                    </button>
                </>
            )}

            {/* WARDEN DASHBOARD */}
            {user?.role === "warden" && (
                <>
                    <h2>Warden Panel</h2>
                    <button onClick={() => navigate("/warden/complaints")}>
                        View Complaints
                    </button>
                </>
            )}

            {/* ADMIN DASHBOARD */}
            {user?.role === "admin" && (
                <>
                    <h2>Admin Panel</h2>
                    <button onClick={() => navigate("/admin/users")}>
                        Manage Users
                    </button>
                    <button onClick={() => navigate("/admin/payments")}>
                        View Payments
                    </button>
                </>
            )}

            <hr />
            <button onClick={logout}>Logout</button>
        </div>
    );
}
