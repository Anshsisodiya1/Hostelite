import { useState, useRef, useEffect } from "react";
import PublicNavbar from "../components/PublicNavbar";
import Modal from "../components/Modal";
import Login from "./Login";
import "../styles/LoginPage.css";
import GetStartedForm from "../pages/GetStartedForm.jsx";
import mailicon from "../assets/mail-icon.svg";
// import messageIcon from "../assets/message-icon.svg";
import PhoneIcon from "../assets/phone-icon.svg";

export default function LoginPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentFacility, setCurrentFacility] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(false);

  const aboutRef = useRef(null);
  const servicesRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentFacility((prev) => (prev + 1) % facilities.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  const facilities = [
    {
      title: "Modern Rooms",
      description:
        "Spacious and well-ventilated rooms with comfortable furniture and study areas",
      image:
        "https://images.unsplash.com/photo-1623625434462-e5e42318ae49?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Mess & Dining",
      description:
        "Hygienic and nutritious meals served in spacious dining halls",
      image:
        "https://images.unsplash.com/photo-1625667782817-228e40c66aba?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Study Areas",
      description:
        "Quiet and well-equipped study spaces with high-speed internet",
      image:
        "https://images.unsplash.com/photo-1719845300019-1af7ad7a51d0?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Recreation Room",
      description: "Entertainment zone with games, TV, and comfortable seating",
      image:
        "https://images.unsplash.com/photo-1586899028174-e7098604235b?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Fitness Center",
      description: "Modern gym equipment and fitness facilities for students",
      image:
        "https://images.unsplash.com/photo-1738321791150-691690dc046e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Laundry Services",
      description: "Automated laundry facilities with modern washing machines",
      image:
        "https://images.unsplash.com/photo-1563310196-3f10e40dd789?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const nextFacility = () => {
    setCurrentFacility((prev) => (prev + 1) % facilities.length);
  };

  const prevFacility = () => {
    setCurrentFacility(
      (prev) => (prev - 1 + facilities.length) % facilities.length,
    );
  };

  const goToFacility = (index) => {
    setCurrentFacility(index);
  };

  const features = [
    {
      icon: "💳",
      title: "Smart Payments",
      description: "Secure online payment gateway with instant receipts",
      stats: "99.9% Uptime",
      image:
        "https://episodesix.com/hs-fs/hubfs/Customer%20using%20smartphone%20for%20NFC%20payment%20at%20cafe.png?width=750&height=470&name=Customer%20using%20smartphone%20for%20NFC%20payment%20at%20cafe.png",
    },
    {
      icon: "🍽️",
      title: "Meal Management",
      description: "Real-time meal feedback and nutrition tracking",
      stats: "4.8★ Rating",
      image:
        "https://fitmencook.com/wp-content/uploads/2023/03/mix-and-match-meal-prep11.jpg",
    },
    {
      icon: "📝",
      title: "Complaint System",
      description: "Quick resolution tracking with status updates",
      stats: "24hr Response",
      image:
        "https://www.scanlanspropertymanagement.com/wp-content/uploads/gergheer.jpg",
    },
  ];

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
        onContactClick={() => setShowGetStarted(true)}
      />

      {/* GET STARTED FORM MODAL */}
      <Modal isOpen={showGetStarted} onClose={() => setShowGetStarted(false)}>
        <GetStartedForm />
      </Modal>

      {/* LOGIN MODAL (ONLY FOR SIGN IN) */}
      <Modal isOpen={showLogin} onClose={() => setShowLogin(false)}>
        <Login />
      </Modal>

      {/* HERO */}
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
            <span>🎓 Trusted by 10,000+ Students</span>
          </div>

          <h1 className="hero-title">
            <span className="gradient-text">Smart Hostel</span>
            <br />
            <span className="gradient-text">Management</span>
          </h1>

          <p className="hero-description">
            One platform for payments, complaints, and meals.
            <br />
            <span className="highlight">Experience seamless hostel living</span>
          </p>

          <div className="hero-actions">
            <button
              className="cta-primary"
              onClick={() => setShowGetStarted(true)}
            >
              Get Started
              <span className="button-arrow">→</span>
            </button>
            <button
              className="cta-secondary"
              onClick={() =>
                servicesRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Learn More
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Institutions</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">99.9%</div>
              <div className="stat-label">Uptime</div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* FACILITIES CAROUSEL */}

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
                <div key={index} className="carousel-slide">
                  <div className="facility-card">
                    <div className="facility-image-container">
                      <img
                        src={facility.image}
                        alt={facility.title}
                        className="facility-image"
                        loading="lazy"
                      />
                      <div className="image-overlay">
                        <div className="overlay-icon">🏢</div>
                      </div>
                    </div>
                    <div className="facility-content">
                      <h3 className="facility-title">{facility.title}</h3>
                      <p className="facility-description">
                        {facility.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              className="carousel-nav carousel-prev"
              onClick={prevFacility}
            >
              <span className="nav-arrow">‹</span>
            </button>
            <button
              className="carousel-nav carousel-next"
              onClick={nextFacility}
            >
              <span className="nav-arrow">›</span>
            </button>
          </div>

          {/* Navigation Dots */}
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

      {/* ABOUT */}

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
                Hostelite is a revolutionary hostel management platform
                transforming the student living experience across 500+
                educational institutions worldwide. Our cutting-edge technology
                seamlessly integrates payments, meal management, and complaint
                systems into one powerful ecosystem.
              </p>

              <div className="about-stats">
                <div className="about-stat">
                  <div className="stat-number-large">500+</div>
                  <div className="stat-label-large">Institutions</div>
                </div>
                <div className="about-stat">
                  <div className="stat-number-large">50K+</div>
                  <div className="stat-label-large">Students</div>
                </div>
                <div className="about-stat">
                  <div className="stat-number-large">99.9%</div>
                  <div className="stat-label-large">Uptime</div>
                </div>
                <div className="about-stat">
                  <div className="stat-number-large">24/7</div>
                  <div className="stat-label-large">Support</div>
                </div>
              </div>

              <div className="about-highlights">
                <div className="highlight-item">
                  <div className="highlight-icon">🚀</div>
                  <div className="highlight-text">
                    Lightning-fast digital payments and transactions
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🍽️</div>
                  <div className="highlight-text">
                    Smart meal planning with real-time feedback system
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">🔧</div>
                  <div className="highlight-text">
                    Quick complaint resolution with live tracking
                  </div>
                </div>
                <div className="highlight-item">
                  <div className="highlight-icon">📱</div>
                  <div className="highlight-text">
                    Mobile-first design for on-the-go access
                  </div>
                </div>
              </div>

              <div className="about-features">
                <div className="about-feature">
                  <div className="feature-icon">💡</div>
                  <div className="feature-text">
                    <h4>Smart Integration</h4>
                    <p>
                      Seamlessly connects all hostel operations into one unified
                      platform
                    </p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-text">
                    <h4>Bank-level Security</h4>
                    <p>
                      Advanced encryption and security protocols protect all
                      student data
                    </p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="feature-icon">📊</div>
                  <div className="feature-text">
                    <h4>Real-time Analytics</h4>
                    <p>
                      Comprehensive insights for hostel administrators and
                      management
                    </p>
                  </div>
                </div>
              </div>

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

      {/* SERVICES */}

      <section id="services" className="services">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Our <span className="accent">Services</span>
            </h2>
            <div className="section-divider"></div>
          </div>

          <div className="service-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`service-card ${activeFeature === index ? "active" : ""}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="service-icon">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="service-image"
                    loading="lazy"
                  />
                </div>
                <h3 className="service-title">{feature.title}</h3>
                <p className="service-description">{feature.description}</p>
                <div className="service-stats">
                  <span className="stats-badge">{feature.stats}</span>
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

      {/* FEATURES HIGHLIGHT */}

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
              <p>
                Process payments and submit complaints in seconds, not minutes
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-large">�</div>
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

      {/* TESTIMONIALS */}

      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              What <span className="accent">Students</span> Say
            </h2>
            <div className="section-divider"></div>
          </div>

          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                "Hostelite has completely transformed how I manage my hostel
                life. The payment system is so convenient and complaint
                resolution is incredibly fast!"
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👨‍🎓</div>
                <div>
                  <div className="author-name">Rahul Kumar</div>
                  <div className="author-role">Computer Engineering</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                "The meal feedback system is amazing! I can rate my meals
                instantly and see improvements. Best hostel management app I've
                ever used."
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👩‍🎓</div>
                <div>
                  <div className="author-name">Priya Sharma</div>
                  <div className="author-role">Mechanical Engineering</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-content">
                "From payments to complaints, everything is just a tap away. The
                interface is intuitive and support team is always helpful.
                Highly recommend!"
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">�‍🎓</div>
                <div>
                  <div className="author-name">Amit Patel</div>
                  <div className="author-role">Electrical Engineering</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          {/* Logo & Description */}
          <div className="footer-brand">
            <h3 className="footer-logo"> Hostelite</h3>
            <p className="footer-description">
              Modern hostel management platform designed to simplify student
              accommodation and streamline operations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>
            <a href="#hero">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#features">Features</a>
            <a href="#testimonials">Testimonials</a>
          </div>

          {/* Resources */}
          <div className="footer-links">
            <h4>Resources</h4>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
            <a href="/forgot-password">Forgot Password</a>
          </div>

          {/* Contact Info */}
          <div className="footer-contact">
            <h4>Contact</h4>

            <div className="contact-item">
              <img src={mailicon} alt="Mail" className="contact-icon" />
              <span>support@hostelite.com</span>
            </div>

            <div className="contact-item">
              <img src={PhoneIcon} alt="Phone" className="contact-icon" />
              <span>+91 98765 43210</span>
            </div>

            <div className="contact-item">
              <span>India</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Hostelite. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
