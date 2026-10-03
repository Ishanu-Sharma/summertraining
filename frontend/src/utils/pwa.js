/**
 * Service worker registration and the update handshake behind the in-app
 * "Update available" prompt.
 *
 * The flow, end to end:
 *   1. A deploy ships a new sw.js (its BUILD_ID differs, so the bytes differ).
 *   2. The browser re-fetches sw.js on navigation, and we also poll with
 *      registration.update() on an interval and whenever the tab is focused,
 *      because an installed PWA can stay open for days without a navigation.
 *   3. The new worker installs and parks in `waiting`. It does NOT activate:
 *      sw.js deliberately omits skipWaiting.
 *   4. onUpdateReady fires, the prompt appears, and only if the user accepts
 *      do we post SKIP_WAITING and reload once the new worker takes control.
 *
 * That is why an installed copy on a phone can update in place. Nobody has to
 * delete and reinstall it.
 */

const UPDATE_POLL_MS = 30 * 60 * 1000;

let reloading = false;

export function registerServiceWorker({ onUpdateReady } = {}) {
  if (!("serviceWorker" in navigator)) return;
  // The dev server has no built sw.js worth running, and a stale worker in dev
  // is a confusing way to lose an hour.
  if (!import.meta.env.PROD) return;

  window.addEventListener("load", async () => {
    let registration;
    try {
      registration = await navigator.serviceWorker.register("/sw.js");
    } catch {
      return; // Unsupported, or blocked by the browser. The site still works.
    }

    const notify = (worker) => {
      // A worker in `waiting` with no controller is the very first install, not
      // an update: there is nothing to replace, so there is nothing to prompt.
      if (worker && navigator.serviceWorker.controller) onUpdateReady?.(registration);
    };

    if (registration.waiting) notify(registration.waiting);

    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) return;
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed") notify(installing);
      });
    });

    // One reload, guarded, when the new worker takes over. Without the flag
    // this can loop on browsers that fire controllerchange more than once.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    });

    const checkForUpdate = () => registration.update().catch(() => undefined);
    setInterval(checkForUpdate, UPDATE_POLL_MS);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkForUpdate();
    });
  });
}

/** Tells the waiting worker to take over. The reload follows controllerchange. */
export function applyUpdate(registration) {
  const waiting = registration?.waiting;
  if (!waiting) {
    window.location.reload();
    return;
  }
  waiting.postMessage({ type: "SKIP_WAITING" });
}

/** True when the page is running as an installed app rather than in a tab. */
export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}
