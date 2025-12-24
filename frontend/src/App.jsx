import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Complaint from "./pages/Complaint";
import MealRating from "./pages/MealRating";
import WardenComplaints from "./pages/WardenComplaints";
import AdminUsers from "./pages/AdminUsers";
import AdminPayments from "./pages/AdminPayments";
import StudentPayment from "./pages/StudentPayment";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard accessible by all logged-in users */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Student routes */}
        <Route
          path="/complaints"
          element={
            <ProtectedRoute role="student">
              <Complaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ratings"
          element={
            <ProtectedRoute role="student">
              <MealRating />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
  element={
    <ProtectedRoute role="student">
      <StudentPayment />
    </ProtectedRoute>
  }
/>
        {/* Warden routes */}
        <Route
          path="/warden/complaints"
          element={
            <ProtectedRoute role="warden">
              <WardenComplaints />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute role="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute role="admin">
              <AdminPayments />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
