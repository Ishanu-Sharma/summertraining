import { Link, useLocation } from "react-router-dom";
import BrandMark from "./BrandMark";
import { useAuth } from "../context/AuthContext";

export default function SiteHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="logo">
          <BrandMark />
          <span className="logo__text">
            The Quad
            <small>Assam Downtown University Alumni Network</small>
          </span>
        </Link>
        <input type="checkbox" id="navToggle" className="nav-toggle-checkbox" />
        <label htmlFor="navToggle" className="nav-toggle-label"><i className="fa-solid fa-bars"></i></label>
        <nav className="main-nav">
          <Link to="/" className={isActive("/")}>Home</Link>
          <Link to="/directory" className={isActive("/directory")}>Directory</Link>
          <Link to="/events" className={isActive("/events")}>Events</Link>
          <Link to="/jobs" className={isActive("/jobs")}>Jobs</Link>
          <Link to="/contact" className={isActive("/contact")}>About &amp; Contact</Link>
        </nav>
        <div className="header-actions">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join the Network</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
