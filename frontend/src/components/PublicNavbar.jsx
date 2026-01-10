import { useState } from "react";
import "../styles/PublicNavbar.css";

export default function PublicNavbar({
  onLoginClick,
  onAboutClick,
  onServicesClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="public-navbar">
      <div className="logo">Hostelite</div>

      {/* DESKTOP MENU */}
      <ul className="nav-links">
        <li onClick={onAboutClick}>About</li>
        <li onClick={onServicesClick}>Services</li>
      </ul>

      <button className="signin-btn desktop-only" onClick={onLoginClick}>
        Sign In
      </button>

      {/* HAMBURGER */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">
          <p
            onClick={() => {
              onAboutClick();
              setMenuOpen(false);
            }}
          >
            About
          </p>
          <p
            onClick={() => {
              onServicesClick();
              setMenuOpen(false);
            }}
          >
            Services
          </p>
          <button
            className="signin-btn"
            onClick={() => {
              onLoginClick();
              setMenuOpen(false);
            }}
          >
            Sign In
          </button>
        </div>
      )}
    </nav>
  );
}