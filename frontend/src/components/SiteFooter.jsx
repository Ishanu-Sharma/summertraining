import { Link } from "react-router-dom";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

/**
 * Every link here goes somewhere real. If you add a column, add the route too:
 * placeholder "#" anchors used to sit in this footer and they are worse than
 * having no link at all.
 */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo logo--light">
              <BrandMark tone="light" />
              The Quad
            </Link>
            <p>
              The Quad is Assam down town University&rsquo;s home for graduates to
              reconnect, mentor, hire, and give back, long after the caps stop flying.
            </p>
            <a
              className="footer-ext-link"
              href="https://adtu.in"
              target="_blank"
              rel="noreferrer noopener"
            >
              adtu.in
              <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
            </a>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/directory">Directory</Link>
            <Link to="/events">Events</Link>
            <Link to="/jobs">Jobs Board</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/messages">Messages</Link>
          </div>

          <div className="footer-col">
            <h4>Your account</h4>
            <Link to="/register">Join the Network</Link>
            <Link to="/login">Log in</Link>
            <Link to="/settings">Edit your profile</Link>
            <Link to="/profile">Your profile</Link>
          </div>

          <div className="footer-col">
            <h4>Learn more</h4>
            <Link to="/stories">Alumni Stories</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/search">Search the site</Link>
            <Link to="/contact">About &amp; Contact</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms and Conditions</Link>
            <a href="mailto:alumni@adtu.in">alumni@adtu.in</a>
            <a href="mailto:student.grievance@adtu.in">Student grievance</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            &copy; 2026 Assam down town University Alumni Relations Office. All rights
            reserved.
          </span>
          <span className="footer-bottom__right">
            <span>Built by the Class of 2026.</span>
            <ThemeToggle className="theme-toggle--light" />
          </span>
        </div>
      </div>
    </footer>
  );
}
