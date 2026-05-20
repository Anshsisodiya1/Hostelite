import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Complaint from "./pages/Complaint";
import WardenComplaints from "./pages/WardenComplaints";
import AdminUsers from "./pages/AdminUsers";
import AdminPayments from "./pages/AdminPayments";
import StudentPayment from "./pages/StudentPayment";
import WardenMeals from "./pages/WardenMeals";
import TodayMeal from "./components/TodayMeal";
import UnderConstruction from "./components/UnderConstruction";
import SystemSettings from "./pages/SystemSettings";
import ForgotPassword from "./pages/ForgotPassword";
import StudentProfile from "./pages/StudentProfile";
import AdminStudentProfile from "./pages/AdminStudentProfile";
import AdvancePayment from "./pages/AdvancePayment";
import RazorpayPayment from "./pages/RazorpayPayment";
import UpiPayment from "./pages/UpiPayment";
import DebitCardPayment from "./pages/DebitCardPayment";
import ReportCard from "./pages/ReportCard";
// import AddHostel from "./pages/AddHostel";

import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ================= REGISTER ROUTE (ADMIN ONLY) ================= */}
        <Route
          path="/register"
          element={
            <ProtectedRoute role="admin">
              <Register />
            </ProtectedRoute>
          }
        />

        {/* ================= PROTECTED LAYOUT ROUTES ================= */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ================= STUDENT ROUTES ================= */}
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
                <div>Ratings Page</div>
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

          <Route
            path="/advance-payment"
            element={
              <ProtectedRoute role="student">
                <AdvancePayment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/razorpay-payment"
            element={
              <ProtectedRoute role="student">
                <RazorpayPayment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upi-payment"
            element={
              <ProtectedRoute role="student">
                <UpiPayment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/debit-card-payment"
            element={
              <ProtectedRoute role="student">
                <DebitCardPayment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/profile"
            element={
              <ProtectedRoute role="student">
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          {/* ================= WARDEN ROUTES ================= */}
          <Route
            path="/warden/complaints"
            element={
              <ProtectedRoute role="warden">
                <WardenComplaints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warden/meals"
            element={
              <ProtectedRoute role="warden">
                <WardenMeals />
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN ROUTES ================= */}
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

          <Route
            path="/admin/report"
            element={
              <ProtectedRoute role="admin">
                <ReportCard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/student/:id"
            element={
              <ProtectedRoute role="admin">
                <AdminStudentProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/under-construction"
            element={
              <ProtectedRoute role="admin">
                <UnderConstruction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/system-settings"
            element={
              <ProtectedRoute role="admin">
                <SystemSettings />
              </ProtectedRoute>
            }
          />

          {/* ================= COMMON ROUTES ================= */}
          <Route path="/today/meals" element={<TodayMeal />} />

          {/* <Route
            path="/admin/add-hostel"
            element={
              <ProtectedRoute role="admin">
                <AddHostel />
              </ProtectedRoute>
            }
          /> */}
        </Route>

        {/* ================= FALLBACK ROUTE ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}