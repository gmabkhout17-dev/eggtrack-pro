const CACHE_NAME = 'eggtrack-v1';
const urlsToCache = [
  '.',
  'index.html',
  'manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  // يمكنك إضافة أيقونات هنا لاحقًا
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // تجاهل طلبات chrome-extension
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      // محاولة جلب الطلب من الشبكة وتخزينه
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // إذا فشل الجلب (غير متصل بالإنترنت) وكان الطلب صورة خريطة، أرجع صورة فارغة
        if (event.request.url.includes('.png') || event.request.url.includes('.jpg')) {
          return new Response('', { status: 200, headers: { 'Content-Type': 'image/png' } });
        }
        // وإلا أرجع صفحة فارغة
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
