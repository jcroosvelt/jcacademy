// sw.js — Service worker de JC Academy (application installable / PWA).
// - Pages : réseau d'abord (toujours la version la plus récente), copie en
//   cache en secours, puis page hors-ligne si rien n'est disponible.
// - Fichiers statiques du site (images, scripts) : affichés depuis le cache
//   et mis à jour en arrière-plan.
// - Supabase, paiements, CDN et autres domaines : jamais interceptés.
const VERSION = 'jc-v1';
const STATIC_CACHE = VERSION + '-static';
const PAGES_CACHE = VERSION + '-pages';
const PRECACHE = [
  '/offline.html',
  '/icon-192.png', '/icon-512.png', '/icon-maskable-192.png', '/icon-maskable-512.png',
  '/apple-touch-icon.png', '/favicon.ico', '/favicon-32x32.png', '/favicon-16x16.png',
  '/site.webmanifest', '/modal.js', '/i18n.js', '/share.js', '/rich.js', '/pwa.js'
];
// Pages privées : jamais gardées en cache (données personnelles)
const NO_CACHE_PAGES = /\/(dashboard-[a-z]+|checkout|mon-profil|completer-profil|login|register|auth-callback|reinitialiser-mot-de-passe|mot-de-passe-oublie|confirmer-inscription|verifiez-votre-email)\.html$/;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // Supabase, CDN, paiements : intouchés
  if (url.pathname === '/sw.js') return;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirstPage(req, url));
    return;
  }
  if (/\.(png|jpe?g|gif|webp|svg|ico|js|css|webmanifest|woff2?)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req));
  }
});

async function networkFirstPage(req, url) {
  try {
    const res = await fetch(req);
    if (res.ok && res.type === 'basic' && !NO_CACHE_PAGES.test(url.pathname)) {
      const copy = res.clone();
      caches.open(PAGES_CACHE).then((c) => c.put(req, copy));
    }
    return res;
  } catch (_e) {
    const cached = await caches.match(req, { ignoreSearch: false });
    if (cached) return cached;
    return (await caches.match('/offline.html')) || new Response('Hors connexion', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res.ok && res.type === 'basic') cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || network;
}
