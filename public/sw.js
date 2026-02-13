const CACHE_NAME = 'sieraaa-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/index.tsx',
    '/icon.jpeg',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
