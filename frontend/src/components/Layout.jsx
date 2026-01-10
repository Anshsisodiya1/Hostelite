import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      
      <main style={{ minHeight: "80vh", padding: "20px" }}>
        <Outlet />
      </main>

      {user && <Footer />}
    </>
  );
}
