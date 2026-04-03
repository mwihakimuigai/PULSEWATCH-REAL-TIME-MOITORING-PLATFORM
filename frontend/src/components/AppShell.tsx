import { Bell, ChartColumn, LayoutDashboard, LogOut, Menu, ShieldCheck, Users } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { PulseWatchLogo } from "./PulseWatchLogo";

const baseLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/events", label: "Events", icon: ShieldCheck },
  { to: "/analytics", label: "Analytics", icon: ChartColumn },
  { to: "/alerts", label: "Alerts", icon: Bell }
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = useMemo(() => {
    if (user?.role === "admin") {
      return [...baseLinks, { to: "/users", label: "Users", icon: Users }];
    }
    return baseLinks;
  }, [user?.role]);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div>
          <div className="brand-block">
            <PulseWatchLogo />
            <div className="brand-copy">
              <p className="eyebrow">Real-Time Monitoring</p>
              <h2>PulseWatch</h2>
              <span className="brand-subtitle">Event Intelligence</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="profile-tile">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
            <small>{user?.role}</small>
          </div>
          <button className="ghost-button" onClick={logout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspace-topbar">
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen((open) => !open)}>
            <Menu size={18} />
          </button>
          <PulseWatchLogo compact />
          <div className="topbar-copy">
            <p className="eyebrow">Operational platform</p>
            <h1>PulseWatch</h1>
          </div>
        </header>
        <div className="workspace-content">{children}</div>
      </div>
    </div>
  );
};
