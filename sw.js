// Ápice · service worker simples: sempre busca a versão nova; sem internet, usa a última salva.
const CACHE = 'apice-v1';
self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return; // Supabase e fontes passam direto
  e.respondWith(fetch(r).then((res) => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then((k) => k.put(r, c)); }
    return res;
  }).catch(() => caches.match(r).then((m) => m || caches.match('./'))));
});
