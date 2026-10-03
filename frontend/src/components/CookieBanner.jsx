import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConsent, hasAnalytics, setConsent } from "../utils/analytics";

/**
 * Shown only when there is actually a choice to make: if this build has no
 * VITE_GA_ID, no analytics script exists, so asking for consent to it would be
 * theatre. The login cookie is strictly necessary and is covered on the privacy
 * page instead of here.
 *
 * Both buttons are equally prominent and equally easy to hit. A greyed-out
 * "decline" next to a bright "accept" is a dark pattern.
 */
export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasAnalytics() && getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  function choose(value) {
    setConsent(value);
    setVisible(false);
  }

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie choices">
      <div className="cookie-banner__text">
        <strong>About cookies on The Quad</strong>
        <p>
          We use Google Analytics to see which parts of the site get used, and nothing
          else. Decline and no analytics cookie is set. The cookie that keeps you
          logged in is not optional and is explained in our{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </div>
      <div className="cookie-banner__actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => choose("denied")}>
          Decline
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => choose("granted")}>
          Accept analytics
        </button>
      </div>
    </div>
  );
}
