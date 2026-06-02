import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Adminsidebar.css";

const Icon = {
  Logo: () => (
    <svg viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#4f6ef7"/>
      <path d="M8 24L16 8l8 16" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 19h11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Payments: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Reports: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Moon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  PanelLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  ChevronUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"/>
    </svg>
  ),
  Email: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  // ✕ close icon — used inside sidebar on mobile
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

const NAV = [
  { id: "dashboard", label: "Dashboard",      icon: Icon.Dashboard, path: "/dashboard" },
  { id: "users",     label: "Manage Users",   icon: Icon.Users,     path: "/admin/users" },
  { id: "payments",  label: "Payments",        icon: Icon.Payments,  path: "/admin/payments" },
  { id: "reports",   label: "Reports",         icon: Icon.Reports,   path: "/admin/report" },
  { id: "settings",  label: "System Settings", icon: Icon.Settings,  path: "/admin/system-settings" },
];

function getAdminInfo() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { name: "Admin", email: "admin@hostelite.com", role: "Admin" };
    const base64Payload = token.split(".")[1];
    const padded = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(padded).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
    const payload = JSON.parse(json);
    return {
      name:  payload.name  || payload.username || payload.user?.name  || "Admin",
      email: payload.email || payload.user?.email || "",
      role:  payload.role  || payload.user?.role  || "Admin",
    };
  } catch {
    return { name: "Admin", email: "", role: "Admin" };
  }
}

function getInitials(name = "") {
  return name.trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "A";
}

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed,   setCollapsed]   = useState(() => localStorage.getItem("sb_collapsed") === "true");
  const [dark,        setDark]        = useState(() => localStorage.getItem("sb_dark") === "true");
  const [profileOpen, setProfileOpen] = useState(false);
  const [tooltip,     setTooltip]     = useState(null);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const profileRef = useRef(null);
  const admin      = getAdminInfo();
  const initials   = getInitials(admin.name);

  useEffect(() => { localStorage.setItem("sb_collapsed", collapsed); }, [collapsed]);
  useEffect(() => { localStorage.setItem("sb_dark", dark); }, [dark]);

  // Close popover on outside click
  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleNavClick = (path) => {
    navigate(path);
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ─── HAMBURGER — mobile only, hides when sidebar is open ─── */}
      <button
        className={`asb-hamburger ${dark ? "asb-hamburger--dark" : ""} ${mobileOpen ? "asb-hamburger--open" : ""}`}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <span /><span /><span />
      </button>

      {/* ─── OVERLAY ─── */}
      {mobileOpen && (
        <div className="asb-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      {/* ─── SIDEBAR ─── */}
      <aside
        className={[
          "asb",
          dark ? "asb--dark" : "asb--light",
          collapsed ? "asb--collapsed" : "asb--expanded",
          mobileOpen ? "asb--mobile-open" : "",
        ].join(" ")}
      >

        {/* ─── TOP: logo + close (mobile) / collapse (desktop) ─── */}
        <div className="asb__top">
          <div className="asb__logo">
            <span className="asb__logo-name">Hostelite</span>
          </div>

          {/* On mobile: show ✕ close button. On desktop: show collapse toggle */}
          <button
            className="asb__collapse-btn asb__mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <Icon.Close />
          </button>

          <div
            className="asb__tip-wrap asb__desktop-toggle"
            onMouseEnter={() => setTooltip("__toggle")}
            onMouseLeave={() => setTooltip(null)}
          >
            <button
              className="asb__collapse-btn"
              onClick={() => { setCollapsed((c) => !c); setTooltip(null); }}
              aria-label="Toggle sidebar"
            >
              <Icon.PanelLeft />
            </button>
            {tooltip === "__toggle" && (
              <span className="asb__tooltip">{collapsed ? "Expand" : "Collapse"}</span>
            )}
          </div>
        </div>

        <div className="asb__rule" />

        {!collapsed && <span className="asb__group-label">Main Menu</span>}

        {/* ─── NAV ─── */}
        <nav className="asb__nav">
          {NAV.map((item) => {
            const NavIcon = item.icon;
            const active  = isActive(item.path);
            return (
              <div
                key={item.id}
                className="asb__tip-wrap"
                onMouseEnter={() => collapsed && setTooltip(item.id)}
                onMouseLeave={() => setTooltip(null)}
              >
                <button
                  className={`asb__nav-btn ${active ? "asb__nav-btn--active" : ""}`}
                  onClick={() => handleNavClick(item.path)}
                >
                  {active && <span className="asb__active-bar" />}
                  <span className="asb__nav-icon"><NavIcon /></span>
                  <span className="asb__nav-label">{item.label}</span>
                </button>
                {collapsed && tooltip === item.id && (
                  <span className="asb__tooltip">{item.label}</span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="asb__flex-gap" />
        <div className="asb__rule" />

        {/* ─── PROFILE ─── */}
        <div
          className="asb__profile-wrap"
          ref={profileRef}
          onMouseEnter={() => collapsed && setTooltip("__profile")}
          onMouseLeave={() => collapsed && setTooltip(null)}
        >
          <button
            className={`asb__profile-btn ${profileOpen ? "asb__profile-btn--open" : ""}`}
            onClick={() => setProfileOpen((o) => !o)}
            aria-label="Profile menu"
          >
            <span className="asb__avatar">{initials}</span>
            <span className="asb__profile-text">
              <span className="asb__profile-name">{admin.name}</span>
              <span className="asb__profile-role">{admin.role}</span>
            </span>
            <span className={`asb__profile-chevron ${profileOpen ? "asb__profile-chevron--up" : ""}`}>
              <Icon.ChevronUp />
            </span>
          </button>

          {collapsed && tooltip === "__profile" && (
            <span className="asb__tooltip">{admin.name}</span>
          )}

          {profileOpen && (
            <div className="asb__popover">
              <div className="asb__popover-head">
                <span className="asb__popover-avatar">{initials}</span>
                <div className="asb__popover-info">
                  <span className="asb__popover-name">{admin.name}</span>
                  <span className="asb__popover-email">
                    <Icon.Email />
                    <span>{admin.email || "No email found"}</span>
                  </span>
                </div>
              </div>

              <div className="asb__popover-divider" />

              <div className="asb__popover-row asb__popover-row--meta">
                <span className="asb__popover-row-icon"><Icon.Shield /></span>
                <span className="asb__popover-row-text">Role</span>
                <span className="asb__role-badge">{admin.role}</span>
              </div>

              <div className="asb__popover-divider" />

              <button
                className="asb__popover-row asb__popover-row--btn"
                onClick={() => setDark((d) => !d)}
              >
                <span className="asb__popover-row-icon">{dark ? <Icon.Sun /> : <Icon.Moon />}</span>
                <span className="asb__popover-row-text">{dark ? "Light Mode" : "Dark Mode"}</span>
                <span className={`asb__theme-pill ${dark ? "asb__theme-pill--on" : ""}`}>
                  <span className="asb__theme-pill-knob" />
                </span>
              </button>

              <div className="asb__popover-divider" />

              <button
                className="asb__popover-row asb__popover-row--btn asb__popover-row--danger"
                onClick={handleLogout}
              >
                <span className="asb__popover-row-icon"><Icon.Logout /></span>
                <span className="asb__popover-row-text">Log out</span>
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
}