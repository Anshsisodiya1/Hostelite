import Navbar from "./Navbar";
import Footer from "./Footer";
import AdminSidebar from "./Adminsidebar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      {/* ADMIN SIDEBAR */}
      {isAdmin && <AdminSidebar />}

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* NAVBAR ONLY FOR STUDENT & WARDEN */}
        {user && !isAdmin && <Navbar />}

        <main
          style={{
            flex: 1,
            minHeight: "80vh",
            padding: "20px",
          }}
        >
          <Outlet />
        </main>

        {/* FOOTER */}
        {user && <Footer />}
      </div>
    </div>
  );
}