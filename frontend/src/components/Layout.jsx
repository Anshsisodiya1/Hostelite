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

  // Sync collapsed state from localStorage (set by AdminSidebar)
  useEffect(() => {
    const interval = setInterval(() => {
      const val = localStorage.getItem("sb_collapsed") === "true";
      setCollapsed(val);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Detect mobile
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // On mobile: no left margin (sidebar is a fixed overlay drawer)
  // On desktop: margin = sidebar width
  const marginLeft = isAdmin && !isMobile
    ? collapsed ? "64px" : "240px"
    : "0";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {isAdmin && <AdminSidebar />}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          marginLeft,
          transition: "margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          width: isAdmin && !isMobile ? "auto" : "100%",
          minWidth: 0,
        }}
      >
        {user && !isAdmin && <Navbar />}
        <main
          style={{
            flex: 1,
            minHeight: "80vh",
            padding: isMobile ? "72px 16px 20px" : "20px",
          }}
        >
          <Outlet />
        </main>
        {user && <Footer />}
      </div>
    </div>
  );
}