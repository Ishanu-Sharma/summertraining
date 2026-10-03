import { useEffect, useState } from "react";
import { applyUpdate, isStandalone, registerServiceWorker } from "../utils/pwa";

/**
 * The "a new version is ready" bar.
 *
 * This is what makes the installed app self-updating: when a deploy lands, the
 * new service worker installs in the background and waits, this appears, and
 * one tap swaps it in. No reinstall, and nothing is swapped out mid-task
 * because the worker never activates on its own.
 *
 * "Later" dismisses the bar but leaves the worker waiting, so the update still
 * applies on the next cold start.
 */
export default function UpdatePrompt() {
  const [registration, setRegistration] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    registerServiceWorker({
      onUpdateReady: (reg) => {
        setRegistration(reg);
        setDismissed(false);
      }
    });
  }, []);

  if (!registration || dismissed) return null;

  return (
    <div className="update-prompt" role="status" aria-live="polite">
      <i className="fa-solid fa-arrows-rotate" aria-hidden="true"></i>
      <div className="update-prompt__text">
        <strong>A new version of The Quad is ready</strong>
        <small>
          {isStandalone()
            ? "Update in place. You will not need to reinstall the app."
            : "Reload to pick up the latest changes."}
        </small>
      </div>
      <div className="update-prompt__actions">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDismissed(true)}>
          Later
        </button>
        <button
          type="button"
          className={"btn btn-primary btn-sm" + (applying ? " is-loading" : "")}
          onClick={() => { setApplying(true); applyUpdate(registration); }}
          disabled={applying}
        >
          {applying ? "Updating" : "Update now"}
        </button>
      </div>
    </div>
  );
}
