// Service worker: deixa o app abrir mesmo sem internet.
// Estratégia: tenta a rede primeiro (para pegar atualizações) e,
// se a internet estiver ruim ou ausente, usa a cópia salva.
const CACHE = 'forja-v8'; // mude o número a cada atualização
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './data.js',
  './three.min.js',
  './figures.js',
  './figure3d.js',
  './body.js',
  './core.js',
  './home.js',
  './workout.js',
  './plans.js',
  './exercises.js',
  './activity.js',
  './bodyview.js',
  './foods.js',
  './diet.js',
  './extras.js',
  './profile.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // espera no máximo 3s pela rede (sinal ruim na academia)
      const res = await Promise.race([
        fetch(req),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
      ]);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) return cached;
      if (req.mode === 'navigate') return cache.match('./index.html');
      throw err;
    }
  })());
});
