/* Plainscript — service worker (Phase 5: PWA / offline support)
 *
 * Strategy: network-first for the same-origin app shell, falling back to
 * a cached copy when offline — so updates land immediately when online,
 * but the app still opens without a connection. Cross-origin requests
 * (openFDA, RxNorm, Supabase, the Claude-proxy Worker) are left
 * completely alone: they need to be live, and this never intercepts or
 * caches them.
 *
 * Bump CACHE_NAME whenever you want to force every client to drop its old
 * cached shell (e.g. after a big index.html change) — the activate step
 * deletes any cache that doesn't match the current name.
 */
const CACHE_NAME = "plainscript-shell-v1";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./config.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;      // never touch openFDA/RxNorm/Supabase/Worker calls
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
