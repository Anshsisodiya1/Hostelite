import { useState, useRef, useEffect } from "react";
import PublicNavbar from "../components/PublicNavbar";
import Modal from "../components/Modal";
import Login from "./Login";
import "../styles/LoginPage.css";
import GetStartedForm from "../pages/GetStartedForm.jsx";
import mailicon from "../assets/mail-icon.svg";
import PhoneIcon from "../assets/phone-icon.svg";
import API from "../services/api";

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentFacility, setCurrentFacility] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);

  // CMS data
  const [hero, setHero]               = useState(null);
  const [about, setAbout]             = useState(null);
  const [facilities, setFacilities]   = useState([]);
  const [services, setServices]       = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [footer, setFooter]           = useState(null);
  const [loading, setLoading]         = useState(true);

  const aboutRef    = useRef(null);
  const servicesRef = useRef(null);

  // ── Fetch all CMS data on mount ──────────────────────
  useEffect(() => {
    Promise.all([
      API.get("/hero"),
      API.get("/about"),
      API.get("/facilities"),
      API.get("/services"),
      API.get("/testimonials"),
      API.get("/footer"),
    ])
      .then(([h, a, f, s, t, ft]) => {
        if (h.data?.hero)               setHero(h.data.hero);
        if (a.data?.about)              setAbout(a.data.about);
        if (f.data?.facilities)         setFacilities(f.data.facilities.filter(i => i.isActive !== false));
        if (s.data?.services)           setServices(s.data.services.filter(i => i.isActive !== false));
        if (t.data?.testimonials)       setTestimonials(t.data.testimonials.filter(i => i.isActive !== false));
        if (ft.data?.footer)            setFooter(ft.data.footer);
      })
      .catch(err => console.error("CMS fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // ── Auto-rotate features ─────────────────────────────
  useEffect(() => {
    if (services.length === 0) return;
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % services.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [services]);

  // ── Auto-rotate carousel ─────────────────────────────
  useEffect(() => {
    if (isPaused || facilities.length === 0) return;
    const interval = setInterval(() => {
      setCurrentFacility(prev => (prev + 1) % facilities.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, facilities]);

  const nextFacility = () => setCurrentFacility(prev => (prev + 1) % facilities.length);
  const prevFacility = () => setCurrentFacility(prev => (prev - 1 + facilities.length) % facilities.length);
  const goToFacility = (i) => setCurrentFacility(i);

  // ── Backend image URL helper ─────────────────────────
  const BASE_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5001"
      : "https://hostelite-1.onrender.com";

  const imgUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path}`;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="cms-loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <PublicNavbar
        onLoginClick={() => setShowLogin(true)}
        onAboutClick={() => aboutRef.current?.scrollIntoView({ behavior: "smooth" })}
        onServicesClick={() => servicesRef.current?.scrollIntoView({ behavior: "smooth" })}
        onContactClick={() => setShowGetStarted(true)}
      />

      <Modal isOpen={showGetStarted} onClose={() => setShowGetStarted(false)}>
        <GetStartedForm />
      </Modal>
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <Login />
      </Modal>

      {/* ── HERO ─────────────────────────────────────── */}
      <section id="hero" className="hero">
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
            <div className="shape shape-5"></div>
            <div className="shape shape-6"></div>
            <div className="shape shape-7"></div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span>{hero?.badge || "🎓 Trusted by 10,000+ Students"}</span>
          </div>

          <h1 className="hero-title">
            <span className="gradient-text">{hero?.titleLine1 || "Smart Hostel"}</span>
            <br />
            <span className="gradient-text">{hero?.titleLine2 || "Management"}</span>
          </h1>

          <p className="hero-description">
            {hero?.description || "One platform for payments, complaints, and meals."}
            <br />
            <span className="highlight">
              {hero?.highlightText || "Experience seamless hostel living"}
            </span>
          </p>

          <div className="hero-actions">
            <button className="cta-primary" onClick={() => setShowGetStarted(true)}>
              {hero?.primaryButtonText || "Get Started"}
              <span className="button-arrow">→</span>
            </button>
            <button
              className="cta-secondary"
              onClick={() => servicesRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              {hero?.secondaryButtonText || "Learn More"}
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{hero?.stat1Number || "500+"}</div>
              <div className="stat-label">{hero?.stat1Label  || "Institutions"}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{hero?.stat2Number || "50K+"}</div>
              <div className="stat-label">{hero?.stat2Label  || "Students"}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{hero?.stat3Number || "99.9%"}</div>
              <div className="stat-label">{hero?.stat3Label  || "Uptime"}</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ── FACILITIES CAROUSEL ──────────────────────── */}
      {facilities.length > 0 && (
        <section id="facilities" className="facilities">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                Our <span className="accent">Facilities</span>
              </h2>
              <div className="section-divider"></div>
            </div>

            <div
              className="carousel-container"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentFacility * 100}%)` }}
              >
                {facilities.map((facility, index) => (
                  <div key={facility._id || index} className="carousel-slide">
                    <div className="facility-card">
                      <div className="facility-image-container">
                        <img
                          src={imgUrl(facility.image)}
                          alt={facility.title}
                          className="facility-image"
                          loading="lazy"
                        />
                        <div className="image-overlay">
                          <div className="overlay-icon">{facility.icon || "🏢"}</div>
                        </div>
                      </div>
                      <div className="facility-content">
                        <h3 className="facility-title">{facility.title}</h3>
                        <p className="facility-description">{facility.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="carousel-nav carousel-prev" onClick={prevFacility}>
                <span className="nav-arrow">‹</span>
              </button>
              <button className="carousel-nav carousel-next" onClick={nextFacility}>
                <span className="nav-arrow">›</span>
              </button>
            </div>

            <div className="carousel-dots">
              {facilities.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${currentFacility === index ? "active" : ""}`}
                  onClick={() => goToFacility(index)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT ────────────────────────────────────── */}
      <section id="about" className="about" ref={aboutRef}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              What is <span className="accent">Hostelite</span>?
            </h2>
            <div className="section-divider"></div>
          </div>

          <div className="about-content">
            <div className="about-text">
              <p className="about-description">
                {about?.description ||
                  "Hostelite is a revolutionary hostel management platform transforming the student living experience across 500+ educational institutions worldwide."}
              </p>

              {/* Stats */}
              {about?.stats?.length > 0 && (
                <div className="about-stats">
                  {about.stats.map((s, i) => (
                    <div key={i} className="about-stat">
                      <div className="stat-number-large">{s.value}</div>
                      <div className="stat-label-large">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Highlights */}
              {about?.highlights?.length > 0 && (
                <div className="about-highlights">
                  {about.highlights.map((h, i) => (
                    <div key={i} className="highlight-item">
                      <div className="highlight-icon">✦</div>
                      <div className="highlight-text">{h}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="about-badges">
                <div className="badge">
                  <span className="badge-icon">🏆</span>
                  <span className="badge-text">Award Winning</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">⭐</span>
                  <span className="badge-text">4.9 Rating</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">🎓</span>
                  <span className="badge-text">Student First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────── */}
      <section id="services" className="services" ref={servicesRef}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Our <span className="accent">Services</span>
            </h2>
            <div className="section-divider"></div>
          </div>

          <div className="service-grid">
            {services.map((service, index) => (
              <div
                key={service._id || index}
                className={`service-card ${activeFeature === index ? "active" : ""}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="service-icon">
                  {service.image ? (
                    <img
                      src={imgUrl(service.image)}
                      alt={service.title}
                      className="service-image"
                      loading="lazy"
                    />
                  ) : (
                    <span style={{ fontSize: 36 }}>{service.icon || "⚙️"}</span>
                  )}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-stats">
                  <span className="stats-badge">{service.stats}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="services-cta">
            <h3>Ready to Transform Your Hostel Experience?</h3>
            <button className="cta-primary" onClick={() => setShowLogin(true)}>
              Get Started Now
              <span className="button-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES HIGHLIGHT ───────────────────────── */}
      <section id="features" className="features-highlight">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Why Choose <span className="accent">Hostelite</span>?
            </h2>
            <div className="section-divider"></div>
          </div>
          <div className="features-showcase">
            <div className="feature-item">
              <div className="feature-icon-large">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Process payments and submit complaints in seconds, not minutes</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-large">🔒</div>
              <h3>100% Secure</h3>
              <p>Your data is protected with enterprise-grade encryption</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-large">📱</div>
              <h3>Mobile First</h3>
              <p>Access all features from anywhere, anytime on any device</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-large">🎯</div>
              <h3>User Friendly</h3>
              <p>Intuitive interface designed specifically for students</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────── */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="testimonials">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">
                What <span className="accent">Students</span> Say
              </h2>
              <div className="section-divider"></div>
            </div>

            <div className="testimonial-grid">
              {testimonials.map((t, index) => (
                <div key={t._id || index} className="testimonial-card">
                  <div className="testimonial-content">"{t.review}"</div>
                  <div className="testimonial-author">
                    {t.avatar ? (
                      <img
                        src={imgUrl(t.avatar)}
                        alt={t.studentName}
                        className="author-avatar"
                        style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="author-avatar">👨‍🎓</div>
                    )}
                    <div>
                      <div className="author-name">{t.studentName}</div>
                      <div className="author-role">{t.course}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3 className="footer-logo">🏠 Hostelite</h3>
            <p className="footer-description">
              {footer?.footerDescription ||
                "Modern hostel management platform designed to simplify student accommodation."}
            </p>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#hero">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/forgot-password">Forgot Password</a>
          </div>

          <div className="footer-contact">
            <h4>Contact</h4>
            <div className="contact-item">
              <img src={mailicon} alt="Mail" className="contact-icon" />
              <span>{footer?.email || "support@hostelite.com"}</span>
            </div>
            <div className="contact-item">
              <img src={PhoneIcon} alt="Phone" className="contact-icon" />
              <span>{footer?.phone || "+91 98765 43210"}</span>
            </div>
            <div className="contact-item">
              <span>{footer?.address || "India"}</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{footer?.copyrightText || `© ${new Date().getFullYear()} Hostelite. All rights reserved.`}</p>
        </div>
      </footer>
    </>
  );
}