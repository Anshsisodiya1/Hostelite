import {
  LayoutTemplate, Info, Building2, Wrench,
  Quote, PanelBottom, ExternalLink, ChevronRight,
} from "lucide-react";

const ICON_MAP = { LayoutTemplate, Info, Building2, Wrench, Quote, PanelBottom };

const NAV_ITEMS = [
  { id: "hero",         label: "Hero section",   icon: "LayoutTemplate" },
  { id: "about",        label: "About section",  icon: "Info"           },
  { id: "facilities",   label: "Facilities",     icon: "Building2"      },
  { id: "services",     label: "Services",       icon: "Wrench"         },
  { id: "testimonials", label: "Testimonials",   icon: "Quote"          },
  { id: "footer",       label: "Footer",         icon: "PanelBottom"    },
];

export default function Sidebar({ active, onSelect, isOpen }) {
  return (
    <aside className={`cms-sidebar ${isOpen ? "cms-sidebar--open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__icon">H</div>
        <div>
          <p className="sidebar-logo__name">Hostelite</p>
          <p className="sidebar-logo__sub">CMS Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <p className="sidebar-nav__label">Sections</p>
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const Icon = ICON_MAP[icon];
          const isActive = active === id;
          return (
            <button
              key={id}
              className={`sidebar-nav__item ${isActive ? "sidebar-nav__item--active" : ""}`}
              onClick={() => onSelect(id)}
            >
              <Icon size={16} className="sidebar-nav__icon" />
              <span>{label}</span>
              {isActive && <ChevronRight size={12} className="sidebar-nav__chevron" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="sidebar-footer__link"
        >
          <ExternalLink size={13} />
          View landing page
        </a>
      </div>
    </aside>
  );
}
