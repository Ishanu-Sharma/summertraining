import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Floating contact button, bottom-right on the public site.
 *
 * It opens a short menu of the three ways to actually reach the Alumni Office
 * rather than a chat widget, because there is no one staffing a chat widget.
 * Phone and email are real `tel:`/`mailto:` links so a phone dials them.
 *
 * Sits to the left of the back-to-top button (see the CSS) so the two never
 * overlap, and both are hidden in print.
 */
export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={"float-contact" + (open ? " is-open" : "")} ref={wrapRef}>
      {open && (
        <div className="float-contact__menu" role="menu" aria-label="Ways to contact us">
          <Link to="/contact" className="float-contact__item" role="menuitem" onClick={() => setOpen(false)}>
            <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
            <span><strong>Send a message</strong><small>Reply within 2 business days</small></span>
          </Link>
          <a href="mailto:alumni@adtu.in" className="float-contact__item" role="menuitem">
            <i className="fa-solid fa-envelope" aria-hidden="true"></i>
            <span><strong>alumni@adtu.in</strong><small>Alumni Relations Office</small></span>
          </a>
          <a href="tel:+913612345678" className="float-contact__item" role="menuitem">
            <i className="fa-solid fa-phone" aria-hidden="true"></i>
            <span><strong>+91 361 234 5678</strong><small>Mon to Fri, 10:00 to 18:00 IST</small></span>
          </a>
        </div>
      )}
      <button
        type="button"
        className="float-contact__btn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close contact options" : "Contact the Alumni Office"}
      >
        <i className={"fa-solid " + (open ? "fa-xmark" : "fa-headset")} aria-hidden="true"></i>
      </button>
    </div>
  );
}
