import { Menu, Circle } from "lucide-react";

const SECTION_LABELS = {
  hero:         "Hero section",
  about:        "About section",
  facilities:   "Facilities",
  services:     "Services",
  testimonials: "Testimonials",
  footer:       "Footer",
};

export default function Topbar({ sectionId, hasUnsaved, onMenuClick }) {
  return (
    <header className="cms-topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
        <Menu size={18} />
      </button>

      <div className="topbar-breadcrumb">
        <span className="topbar-breadcrumb__root">CMS</span>
        <span className="topbar-breadcrumb__sep">/</span>
        <span className="topbar-breadcrumb__page">{SECTION_LABELS[sectionId]}</span>
      </div>

      <div className="topbar-right">
        {hasUnsaved && (
          <span className="topbar-unsaved">
            <Circle size={6} fill="currentColor" />
            Unsaved changes
          </span>
        )}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="topbar-view-btn"
        >
          View site ↗
        </a>
      </div>
    </header>
  );
}
