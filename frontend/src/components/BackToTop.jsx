import { useEffect, useState } from "react";

/**
 * Appears once there is enough page behind you to be worth skipping. The scroll
 * listener only flips a boolean, so it re-renders at most twice per visit to a
 * given scroll depth rather than on every scroll event.
 */
export default function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // Return focus to the top of the document, so a keyboard user's next Tab
    // continues from the header rather than from wherever the button was.
    const main = document.getElementById("main");
    if (main) main.focus({ preventScroll: true });
  }

  return (
    <button
      type="button"
      className={"back-to-top" + (shown ? " is-visible" : "")}
      onClick={toTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
    >
      <i className="fa-solid fa-arrow-up" aria-hidden="true"></i>
    </button>
  );
}
