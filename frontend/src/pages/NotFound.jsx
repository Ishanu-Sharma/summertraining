import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import SiteSearch from "../components/SiteSearch";
import { useDocumentTitle } from "../utils/useDocumentTitle";
import { trackEvent } from "../utils/analytics";

/**
 * The 404. A dead end is where people leave, so this page does three things
 * instead of apologising: it offers search, it links the destinations people
 * are usually looking for, and it records the path that missed so broken links
 * can actually be found and fixed.
 */
export default function NotFound() {
  const location = useLocation();
  useDocumentTitle(
    "Page not found",
    "That page does not exist. Search The Quad or pick up from the directory, events, or jobs board."
  );

  useEffect(() => {
    trackEvent("page_not_found", { missing_path: location.pathname });
  }, [location.pathname]);

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="section">
          <div className="container">
            <div className="notfound">
              <p className="notfound__code" aria-hidden="true">404</p>
              <h1>We cannot find that page</h1>
              <p className="lede">
                The address <code>{location.pathname}</code> does not match anything on
                The Quad. It may have been moved, or the link that sent you here may
                be out of date.
              </p>

              <div className="notfound__search">
                <SiteSearch placeholder="Search for what you were after" />
              </div>

              <div className="notfound__links">
                <Link to="/" className="btn btn-primary">Back to the home page</Link>
                <Link to="/contact" className="btn btn-secondary">Report a broken link</Link>
              </div>

              <div className="related-links related-links--center">
                <h3>Popular destinations</h3>
                <ul>
                  <li><Link to="/directory">Alumni directory</Link></li>
                  <li><Link to="/events">Events and reunions</Link></li>
                  <li><Link to="/jobs">Jobs board</Link></li>
                  <li><Link to="/stories">Alumni stories</Link></li>
                  <li><Link to="/faq">Frequently asked questions</Link></li>
                  <li><Link to="/login">Log in to your account</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
