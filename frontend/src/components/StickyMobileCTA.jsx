import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * The bar that docks to the bottom of the viewport on phones.
 *
 * Only rendered for signed-out visitors, and only once the hero's own buttons
 * have been scrolled past, so it never covers the CTA it duplicates. The
 * threshold is measured from the hero element when there is one rather than
 * guessed at a fixed pixel value, since the hero's height is a clamp().
 *
 * Shown on narrow viewports only (CSS), and the page gets bottom padding while
 * it is up so it cannot hide the last line of the footer.
 */
export default function StickyMobileCTA() {
  const { user } = useAuth();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (user) return;

    const compute = () => {
      const hero = document.querySelector(".hero");
      const threshold = hero ? hero.offsetTop + hero.offsetHeight - 80 : 600;
      setShown(window.scrollY > threshold);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute, { passive: true });
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle("has-sticky-cta", shown);
    return () => document.body.classList.remove("has-sticky-cta");
  }, [shown]);

  if (user) return null;

  return (
    <div className={"sticky-cta" + (shown ? " is-visible" : "")} aria-hidden={!shown}>
      <div className="sticky-cta__text">
        <strong>Find your batch</strong>
        <small>Free for every AdtU graduate</small>
      </div>
      <Link to="/register" className="btn btn-primary btn-sm" tabIndex={shown ? 0 : -1}>
        Join
      </Link>
    </div>
  );
}
