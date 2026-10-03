import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";
import { resolveAvatar } from "../utils/format";
import BrandMark from "./BrandMark";
import SiteSearch from "./SiteSearch";
import ThemeToggle from "./ThemeToggle";
import Breadcrumbs from "./Breadcrumbs";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "fa-house", label: "Dashboard" },
  { to: "/directory", icon: "fa-users", label: "Directory" },
  { to: "/events", icon: "fa-calendar-days", label: "Events" },
  { to: "/jobs", icon: "fa-briefcase", label: "Jobs Board" },
  { to: "/messages", icon: "fa-comment-dots", label: "Messages" }
];

function roleLabel(user) {
  if (user.role === "admin") return "Administrator";
  if (user.role === "student") return "Current Student · Class of " + user.gradYear;
  return "Class of " + user.gradYear;
}

export default function AppShell({ children, searchable = true, breadcrumbs }) {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const showToast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleRef = useRef(null);

  async function refreshUnread() {
    try {
      const { count } = await api.get("/conversations/unread-count");
      setUnread(count);
    } catch { /* non-critical */ }
  }

  useEffect(() => { refreshUnread(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => refreshUnread();
    socket.on("message:new", handler);
    socket.on("conversation:read", handler);
    return () => {
      socket.off("message:new", handler);
      socket.off("conversation:read", handler);
    };
  }, [socket]);

  // Navigating closes the mobile sidebar; Escape closes it and returns focus
  // to the button that opened it.
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen]);

  if (!user) return null;

  function handleLogout(e) {
    e.preventDefault();
    logout();
    navigate("/login");
  }

  return (
    <div className={"app-shell" + (sidebarOpen ? " sidebar-open" : "")}>
      <aside className="app-sidebar" aria-label="Main navigation">
        <Link to="/dashboard" className="logo">
          <BrandMark tone="light" />
          <span className="logo__text">
            The Quad
            <small>Assam down town University</small>
          </span>
        </Link>
        <nav className="side-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname === item.to ? "active" : ""}
              aria-current={location.pathname === item.to ? "page" : undefined}
            >
              <i className={"fa-solid " + item.icon} aria-hidden="true"></i> {item.label}
            </Link>
          ))}

          <div className="nav-label">Account</div>
          <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}>
            <i className="fa-solid fa-id-badge" aria-hidden="true"></i> My Profile
          </Link>
          <Link to="/settings" className={location.pathname === "/settings" ? "active" : ""}>
            <i className="fa-solid fa-gear" aria-hidden="true"></i> Settings
          </Link>

          <div className="nav-label">The Quad</div>
          <Link to="/stories" className={location.pathname === "/stories" ? "active" : ""}>
            <i className="fa-solid fa-bookmark" aria-hidden="true"></i> Alumni Stories
          </Link>
          <Link to="/faq" className={location.pathname === "/faq" ? "active" : ""}>
            <i className="fa-solid fa-circle-question" aria-hidden="true"></i> Help &amp; FAQ
          </Link>

          {user.role === "admin" && (
            <div className="admin-nav-group">
              <div className="nav-label">Admin</div>
              <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>
                <i className="fa-solid fa-shield-halved" aria-hidden="true"></i> Admin Panel
              </Link>
            </div>
          )}
        </nav>
        <div className="sidebar-user">
          <img src={resolveAvatar(user.avatar)} alt="" />
          <div>
            <div className="name">{user.fullName}</div>
            <div className="role">{roleLabel(user)}</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{ marginLeft: "auto", color: "rgba(251,246,238,.6)" }}
            title="Log out"
            aria-label="Log out"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
          </button>
        </div>
      </aside>

      {/* Tapping the dimmed page behind an open sidebar closes it, which is
          what every phone user expects a drawer to do. */}
      {sidebarOpen && (
        <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <div className="app-main">
        <header className="app-topbar">
          <button
            type="button"
            className="sidebar-toggle"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setSidebarOpen((open) => !open)}
            ref={toggleRef}
          >
            <i className={"fa-solid " + (sidebarOpen ? "fa-xmark" : "fa-bars")} aria-hidden="true"></i>
          </button>

          {searchable && (
            <div className="topbar-search">
              <SiteSearch placeholder="Search alumni, events, jobs" />
            </div>
          )}

          <div className="topbar-actions">
            <ThemeToggle />
            <button
              className="icon-btn"
              aria-label="Notifications"
              onClick={() => showToast("You're all caught up. No new notifications.", "info")}
            >
              <i className="fa-solid fa-bell" aria-hidden="true"></i><span className="badge-dot"></span>
            </button>
            <Link to="/messages" className="icon-btn" aria-label={unread ? `Messages, ${unread} unread` : "Messages"}>
              <i className="fa-solid fa-comment-dots" aria-hidden="true"></i>
              <span className={"badge-dot" + (unread === 0 ? " hidden" : "")}></span>
            </Link>
            <Link to="/profile" className="user-chip">
              <img src={resolveAvatar(user.avatar)} alt="" />
              <div><div className="name">{user.fullName}</div><div className="role">{roleLabel(user)}</div></div>
            </Link>
          </div>
        </header>
        <main className="app-content" id="main" tabIndex={-1}>
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          {children}
        </main>
      </div>
    </div>
  );
}
