import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, role }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) return <p>Loading...</p>;

    if (!isAuthenticated) return <Navigate to="/login" />;

    // role check
    if (role && user?.role !== role) return <Navigate to="/dashboard" />;

    return children;
}
