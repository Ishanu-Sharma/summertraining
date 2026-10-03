import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/**
 * Promise-based confirmation modal, a drop-in replacement for window.confirm.
 *
 *   const confirm = useConfirm();
 *   if (!await confirm({ title: "Delete this event?", tone: "danger" })) return;
 *
 * window.confirm cannot be styled, cannot be themed, and on mobile Safari it
 * is rendered as a system sheet that says the hostname. This keeps the same
 * one-line call shape so nothing at the call sites gets more complicated.
 *
 * Accessibility: role="dialog" + aria-modal, focus moved to the confirm
 * button on open and returned to the trigger on close, Escape cancels, a
 * click on the backdrop cancels, and Tab is cycled inside the dialog so focus
 * cannot wander into the page behind it.
 */

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const resolveRef = useRef(null);
  const dialogRef = useRef(null);
  const confirmRef = useRef(null);
  const previousFocusRef = useRef(null);

  const confirm = useCallback((options) => {
    previousFocusRef.current = document.activeElement;
    setRequest(typeof options === "string" ? { title: options } : options || {});
    return new Promise((resolve) => { resolveRef.current = resolve; });
  }, []);

  const close = useCallback((result) => {
    setRequest(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
    const previous = previousFocusRef.current;
    if (previous && typeof previous.focus === "function") previous.focus();
  }, []);

  useEffect(() => {
    if (!request) return;

    confirmRef.current?.focus();

    // The page behind a modal must not scroll under it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll("button, [href], input, select, textarea");
      if (!focusable || !focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [request, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) close(false); }}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirmTitle"
            aria-describedby={request.body ? "confirmBody" : undefined}
            ref={dialogRef}
          >
            <div className={"modal__icon" + (request.tone === "danger" ? " modal__icon--danger" : "")}>
              <i
                className={"fa-solid " + (request.tone === "danger" ? "fa-triangle-exclamation" : "fa-circle-question")}
                aria-hidden="true"
              ></i>
            </div>
            <h3 id="confirmTitle">{request.title || "Are you sure?"}</h3>
            {request.body && <p id="confirmBody" className="text-soft">{request.body}</p>}
            <div className="modal__actions">
              <button type="button" className="btn btn-secondary" onClick={() => close(false)}>
                {request.cancelLabel || "Cancel"}
              </button>
              <button
                type="button"
                className={"btn " + (request.tone === "danger" ? "btn-danger" : "btn-primary")}
                onClick={() => close(true)}
                ref={confirmRef}
              >
                {request.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
