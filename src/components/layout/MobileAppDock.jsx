import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Images, PackageSearch } from "lucide-react";

const TABS = [
  { to: "/shop", label: "Shop", icon: Home, match: (path) => path.startsWith("/shop") },
  { to: "/collections", label: "Looks", icon: LayoutGrid, match: (path) => path.startsWith("/collections") },
  { to: "/gallery", label: "Gallery", icon: Images, match: (path) => path.startsWith("/gallery") },
  { to: "/track", label: "Track", icon: PackageSearch, match: (path) => path.startsWith("/track") },
];

const HIDDEN = ["/auth", "/admin", "/checkout", "/product"];

const MobileAppDock = () => {
  const { pathname } = useLocation();
  if (HIDDEN.some((path) => pathname.startsWith(path)) || pathname === "/" || pathname === "/home") return null;

  return (
    <nav className="mobile-app-dock" aria-label="Main pages">
      {TABS.map(({ to, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <NavLink
            key={to}
            to={to}
            className={`mobile-app-dock-item${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
            {active && <span>{label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileAppDock;
