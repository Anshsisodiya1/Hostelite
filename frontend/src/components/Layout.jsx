import Navbar from "./Navbar";
import Footer from "./Footer";
import AdminSidebar from "./Adminsidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";

export default function Layout() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sb_collapsed") === "true"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const val = localStorage.getItem("sb_collapsed") === "true";
      setCollapsed(val);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {isAdmin && <AdminSidebar />}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft: isAdmin ? (collapsed ? "64px" : "240px") : "0",
          transition: "margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {user && !isAdmin && <Navbar />}
        <main style={{ flex: 1, minHeight: "80vh", padding: "20px" }}>
          <Outlet />
        </main>
        {user && <Footer />}
      </div>
    </div>
  );
}