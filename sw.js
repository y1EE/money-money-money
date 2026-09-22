// Offline support, network-first: always try to fetch the latest version
// when online (so redeploys show up immediately, no need to delete and
// re-add the home screen icon), and only fall back to the last cached
// copy when the network genuinely fails (offline). An earlier version of
// this file did the opposite (served the cache first, network only
// updated it quietly in the background) — that meant a redeploy would
// never show up until something forced a full re-fetch, which is exactly
// the "have to delete and re-add the icon" symptom this fixes.

const CACHE_NAME = "yees-money-github-crop-stockfix-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // only cache our own assets

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
