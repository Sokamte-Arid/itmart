/* IT Mart Admin — service worker
 *
 * 1. Makes the admin installable and able to open without network
 *    (the app shell is cached; data always comes live from the API).
 * 2. Receives push notifications (new orders, low stock) and opens the
 *    right page when one is tapped.
 *
 * Bump CACHE_VERSION if you ever need to force every device to drop its cache.
 */
const CACHE_VERSION = 'v1';
const SHELL_CACHE = `itmart-admin-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `itmart-admin-assets-${CACHE_VERSION}`;
const SHELL_URL = '/index.html';
const PRECACHE = [SHELL_URL, '/manifest.webmanifest', '/favicon.svg', '/pwa-192.png', '/pwa-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .catch(() => {}) // never block installation on caching
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('itmart-admin-') && k !== SHELL_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API calls and uploaded images always go to the network — admin data must be live.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return;

  // Page loads: network first (always the latest version), cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(SHELL_URL, copy));
          }
          return res;
        })
        .catch(() => caches.match(SHELL_URL))
    );
    return;
  }

  // Built JS/CSS files have a content hash in their name, so they never change:
  // cache first. (In development these paths don't exist, so dev is unaffected.)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSET_CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
      )
    );
  }
});

// ---------------------------------------------------------------------------
// Push notifications
// ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'IT Mart Admin';
  const options = {
    body: data.body || '',
    icon: '/pwa-192.png',
    badge: '/pwa-192.png',
    tag: data.tag,
    renotify: Boolean(data.tag),
    vibrate: [120, 60, 120],
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // Let open windows refresh their data (e.g. the orders list)
      self.clients
        .matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => clients.forEach((c) => c.postMessage({ type: 'push', payload: data }))),
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Reuse an open window of the app if there is one
      for (const client of clients) {
        if (new URL(client.url).origin === self.location.origin && 'focus' in client) {
          return client.focus().then((c) => (c && 'navigate' in c ? c.navigate(target) : c));
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
