import { useState, useRef } from "react";
import PublicNavbar from "../components/PublicNavbar";
import Modal from "../components/Modal";
import Login from "./Login";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);

  const aboutRef = useRef(null);
  const servicesRef = useRef(null);

  return (
    <>
      <PublicNavbar
        onLoginClick={() => setShowLogin(true)}
        onAboutClick={() =>
          aboutRef.current?.scrollIntoView({ behavior: "smooth" })
        }
        onServicesClick={() =>
          servicesRef.current?.scrollIntoView({ behavior: "smooth" })
        }
      />

      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <Login />
      </Modal>

      {/* HERO */}
      <section className="hero">
        <h1>Smart Hostel Management Made Easy</h1>
        <p>One platform for payments, complaints, and meals.</p>
      </section>

      {/* ABOUT */}
      <section className="about" ref={aboutRef}>
        <h2>What is Hostelite?</h2>
        <p>
          Hostelite is a modern hostel management system for students,
          wardens, and admins.
        </p>
      </section>

      {/* SERVICES */}
      <section className="services" ref={servicesRef}>
        <h2>Our Services</h2>

        <div className="service-grid">
          <div className="service-card">Online Payments</div>
          <div className="service-card">Meal Feedback</div>
          <div className="service-card">Complaint System</div>
        </div>
      </section>

      <footer className="footer">© Hostelite</footer>
    </>
  );
}