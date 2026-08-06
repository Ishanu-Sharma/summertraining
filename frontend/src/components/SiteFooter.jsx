import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo" style={{ color: "#fff" }}>
              <span className="logo-mark"><span>🎓</span></span>
              The Quad
            </Link>
            <p>The Quad is Assam Downtown University's home for graduates to reconnect, mentor, hire, and give back — long after the caps stop flying.</p>
            <div className="social-icons">
              <a href="#" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" aria-label="X"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
            </div>
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
            <h4>Community</h4>
            <a href="#">Mentorship</a>
            <a href="#">Give Back</a>
            <a href="#">Success Stories</a>
            <a href="#">City Chapters</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <Link to="/contact">Contact Us</Link>
            <a href="#">Help Center</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Assam Downtown University Alumni Relations Office. All rights reserved.</span>
          <span>Built with pride by the Class of 2026.</span>
        </div>
      </div>
    </footer>
  );
}
