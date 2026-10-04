import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BrandMark from "./BrandMark";
import { CloseIcon, MenuIcon } from "./NavIcons";
import SiteSearch from "./SiteSearch";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

/**
 * The public site header. Sticky, so navigation and search stay reachable at
 * any scroll depth, and it gains a shadow once the page has moved so it reads
 * as sitting above the content rather than welded to it.
 *
 * The mobile menu is a real button with aria-expanded driving a panel, not the
 * checkbox hack that used to be here. The checkbox could not be closed by
 * Escape, could not be closed by navigating, and announced itself to screen
 * readers as an unlabelled checkbox.
 */
export default function SiteHeader() {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);

  const isActive = (path) => (location.pathname === path ? "active" : "");

  // Any navigation closes the menu. Without this it stays open over the new
  // page, because React Router does not remount the header.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className={"site-header" + (scrolled ? " is-scrolled" : "")}>
      <div className="container site-header__inner">
        <Link to="/" className="logo">
          <BrandMark />
          <span className="logo__text">
            The Quad
            <small>Assam down town University Alumni Network</small>
          </span>
        </Link>

        <div className="site-header__search">
          <SiteSearch placeholder="Search The Quad" />
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls="primaryNav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
          ref={toggleRef}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav
          className={"main-nav" + (menuOpen ? " is-open" : "")}
          id="primaryNav"
          aria-label="Primary"
        >
          <Link to="/" className={isActive("/")}>Home</Link>
          <Link to="/directory" className={isActive("/directory")}>Directory</Link>
          <Link to="/events" className={isActive("/events")}>Events</Link>
          <Link to="/jobs" className={isActive("/jobs")}>Jobs</Link>
          <Link to="/stories" className={isActive("/stories")}>Stories</Link>
          <Link to="/faq" className={isActive("/faq")}>FAQ</Link>
          <Link to="/contact" className={isActive("/contact")}>Contact</Link>

          {/* Inside the mobile panel these replace the header actions, which
              are hidden at that width. */}
          <div className="main-nav__actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Join the Network</Link>
              </>
            )}
          </div>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
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
