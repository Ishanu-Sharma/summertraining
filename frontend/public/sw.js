/* The Quad: service worker.
 *
 * BUILD_ID is rewritten at build time by the vite plugin in vite.config.js, so
 * every deploy ships a byte-different worker. That is the whole update
 * mechanism: the browser re-fetches this file, sees it changed, installs the
 * new worker, and parks it in `waiting` until the page tells it to take over.
 * The in-app "Update available" prompt is what sends that message, which is
 * why an installed copy can update itself instead of being deleted and
 * reinstalled.
 *
 * Caching strategy, by request type:
 *   navigations      network-first, falling back to the cached shell offline
 *   /assets/* (hashed) cache-first, because the filename changes when content does
 *   other same-origin  stale-while-revalidate
 *   API and uploads    never cached, always straight to the network
 */

const BUILD_ID = "__BUILD_ID__";
const SHELL_CACHE = `quad-shell-${BUILD_ID}`;
const ASSET_CACHE = `quad-assets-${BUILD_ID}`;
const SHELL_URL = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll([SHELL_URL, "/favicon.svg", "/manifest.webmanifest"]))
      // A failed precache must not block the install, or a single 404 would
      // wedge the whole update.
      .catch(() => undefined)
  );
  // Note: no skipWaiting() here. The new worker waits until the user accepts
  // the update, so a page is never swapped out from under someone mid-form.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("quad-") && key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data && event.data.type === "GET_VERSION") {
    event.source?.postMessage({ type: "VERSION", buildId: BUILD_ID });
  }
});

function isHashedAsset(url) {
  return url.pathname.startsWith("/assets/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;       // fonts, CDN, API host
  if (url.pathname.startsWith("/api/")) return;          // never cache API reads
  if (url.pathname.startsWith("/uploads/")) return;      // user avatars

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put(SHELL_URL, fresh.clone());
          return fresh;
        } catch {
          // Offline. Every route is the same SPA shell, so this is correct for
          // any path, not just "/".
          const cached = await caches.match(SHELL_URL);
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  if (isHashedAsset(url)) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fresh = await fetch(request);
        if (fresh.ok) {
          const cache = await caches.open(ASSET_CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      })()
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })()
  );
});
