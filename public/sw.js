const cacheName = 'analysis-shell-v2'

function fetchAndCache(event, request) {
  const networkResponse = fetch(request)
  event.waitUntil(
    networkResponse
      .then((response) => {
        if (!response.ok) return
        return caches.open(cacheName).then((cache) => cache.put(request, response.clone()))
      })
      .catch(() => {
        // The response path below handles network failures.
      }),
  )
  return networkResponse
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(caches.match(request).then((cached) => cached ?? fetchAndCache(event, request)))
    return
  }

  event.respondWith(
    fetchAndCache(event, request).catch(async () => {
      const cached = await caches.match(request)
      if (cached) return cached
      if (request.mode === 'navigate') return caches.match('/')
      return Response.error()
    }),
  )
})
