import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useToast } from "../context/ToastContext";
import { api } from "../api/client";
import { resolveAvatar } from "../utils/format";

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

export default function AppShell({ children, searchable = true }) {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const showToast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

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

  if (!user) return null;

  function handleLogout(e) {
    e.preventDefault();
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <input type="checkbox" id="sidebarToggle" className="sidebar-toggle-checkbox" />
      <aside className="app-sidebar">
        <Link to="/dashboard" className="logo">
          <span className="logo-mark"><span>🎓</span></span>
          The Quad <small>Assam Downtown University</small>
        </Link>
        <nav className="side-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.to} to={item.to} className={location.pathname === item.to ? "active" : ""}>
              <i className={"fa-solid " + item.icon}></i> {item.label}
            </Link>
          ))}
          <a href="#"><i className="fa-solid fa-handshake-angle"></i> Mentorship</a>

          <div className="nav-label">Account</div>
          <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}>
            <i className="fa-solid fa-id-badge"></i> My Profile
          </Link>
          <Link to="/settings" className={location.pathname === "/settings" ? "active" : ""}>
            <i className="fa-solid fa-gear"></i> Settings
          </Link>

          {user.role === "admin" && (
            <div className="admin-nav-group">
              <div className="nav-label">Admin</div>
              <Link to="/admin" className={location.pathname === "/admin" ? "active" : ""}>
                <i className="fa-solid fa-shield-halved"></i> Admin Panel
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
          <a href="#" onClick={handleLogout} style={{ marginLeft: "auto", color: "rgba(251,246,238,.6)" }} title="Log out">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          </a>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <label htmlFor="sidebarToggle" className="sidebar-toggle-label"><i className="fa-solid fa-bars"></i></label>
          {searchable && (
            <div className="topbar-search input-icon">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="search" placeholder="Search alumni, events, jobs..." />
            </div>
          )}
          <div className="topbar-actions">
            <button className="icon-btn" aria-label="Notifications" onClick={() => showToast("You're all caught up — no new notifications.", "info")}>
              <i className="fa-solid fa-bell"></i><span className="badge-dot"></span>
            </button>
            <Link to="/messages" className="icon-btn" aria-label="Messages">
              <i className="fa-solid fa-comment-dots"></i>
              <span className={"badge-dot" + (unread === 0 ? " hidden" : "")}></span>
            </Link>
            <Link to="/profile" className="user-chip">
              <img src={resolveAvatar(user.avatar)} alt="" />
              <div><div className="name">{user.fullName}</div><div className="role">{roleLabel(user)}</div></div>
            </Link>
          </div>
        </header>
        <div className="app-content">
          {children}
        </div>
      </div>
    </div>
  );
}
