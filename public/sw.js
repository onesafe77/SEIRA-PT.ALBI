const CACHE_NAME = 'sieraaa-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/icon.jpeg',
    '/wallpaper.jpeg',
    '/logo_final.png',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;500;700&display=swap',
    'https://esm.sh/react@^19.2.3',
    'https://esm.sh/react-dom@^19.2.3'
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
