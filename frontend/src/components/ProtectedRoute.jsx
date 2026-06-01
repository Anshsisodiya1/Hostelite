import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <p>Loading...</p>;

  // Redirect to correct login page based on role hint or default to "/"
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Role mismatch — redirect to their correct dashboard
  if (role && user?.role !== role) {
    if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}