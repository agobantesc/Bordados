// Service worker del Taller de Bordado: deja la app disponible sin internet.
// Estrategia "cache primero, actualizar por detrás": abre al tiro desde el
// caché y descarga la versión nueva en segundo plano para la próxima vez.
var CACHE = 'bordados-v31';   // AlmaApp 3.2 · Estudio PRO+ (filtros de tono, texto profundo, copias)
var ARCHIVOS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './iconobordados192.png',
  './iconobordados512.png',
  './iconobordados180.png'
];

self.addEventListener('install', function (e) {
  // NO hacemos skipWaiting aquí: la versión nueva espera hasta que la usuaria toque "Actualizar"
  // (así no se recarga la app a mitad de un diseño). La página avisa con un botón.
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }));
});

self.addEventListener('message', function (e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (claves) {
      return Promise.all(claves.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (enCache) {
      var red = fetch(e.request).then(function (resp) {
        if (resp && resp.ok) {
          var copia = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
        }
        return resp;
      }).catch(function () { return enCache; });
      return enCache || red;
    })
  );
});
