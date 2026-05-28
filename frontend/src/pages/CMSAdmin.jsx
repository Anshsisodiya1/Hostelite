import { useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Toast from "../components/Toast";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import FacilitiesSection from "../components/sections/FacilitiesSection";
import ServicesSection from "../components/sections/ServicesSection";
import TestimonialsSection from "../components/sections/TestimonialsSection";
import FooterSection from "../components/sections/FooterSection";
import "../styles/CMSAdmin.css";

export const NAV_ITEMS = [
  { id: "hero",         label: "Hero",         icon: "LayoutTemplate" },
  { id: "about",        label: "About",        icon: "Info"           },
  { id: "facilities",   label: "Facilities",   icon: "Building2"      },
  { id: "services",     label: "Services",     icon: "Wrench"         },
  { id: "testimonials", label: "Testimonials", icon: "Quote"          },
  { id: "footer",       label: "Footer",       icon: "PanelBottom"    },
];

export default function CMSAdmin() {
  const [activeSection, setActiveSection] = useState("hero");
  const [toast, setToast]     = useState({ msg: "", type: "success", visible: false });
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type, visible: true });
    if (type === "success") setHasUnsaved(false);
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  }, []);

  const markUnsaved = useCallback(() => setHasUnsaved(true), []);
  const sectionProps = { showToast, markUnsaved };

  const sectionMap = {
    hero:         <HeroSection         {...sectionProps} />,
    about:        <AboutSection        {...sectionProps} />,
    facilities:   <FacilitiesSection   {...sectionProps} />,
    services:     <ServicesSection     {...sectionProps} />,
    testimonials: <TestimonialsSection {...sectionProps} />,
    footer:       <FooterSection       {...sectionProps} />,
  };

  return (
    <div className="cms-shell">
      {sidebarOpen && (
        <div className="cms-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        active={activeSection}
        onSelect={(id) => { setActiveSection(id); setSidebarOpen(false); }}
        isOpen={sidebarOpen}
      />
      <div className="cms-main">
        <Topbar
          sectionId={activeSection}
          hasUnsaved={hasUnsaved}
          onMenuClick={() => setSidebarOpen(s => !s)}
        />
        <div className="cms-body">
          {sectionMap[activeSection]}
        </div>
      </div>
      <Toast {...toast} />
    </div>
  );
}
