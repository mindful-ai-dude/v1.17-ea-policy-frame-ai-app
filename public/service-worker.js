// Service Worker for EA PolicyFrame App
const CACHE_NAME = 'ea-policyframe-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
  '/assets/index.css',
  '/assets/index.js',
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for API calls, cache-first for static assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes(self.location.hostname)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // API calls - network first, then cache
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('convex.cloud')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before using it
          const responseToCache = response.clone();
          
          // Only cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Static assets - cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return from cache if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response before using it
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
            
          return response;
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: {
      url: data.url || '/',
    },
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-content') {
    event.waitUntil(syncContent());
  }
});

// Function to sync content in background
async function syncContent() {
  try {
    // Get pending sync items from IndexedDB
    const db = await openDatabase();
    const pendingSyncs = await getPendingSyncs(db);
    
    // Process each pending sync
    for (const sync of pendingSyncs) {
      try {
        // Attempt to sync with server
        await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sync.data),
        });
        
        // Mark as synced
        await markAsSynced(db, sync.id);
      } catch (error) {
        console.error('Failed to sync item:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper function to open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ea-policyframe-sync', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingSyncs')) {
        db.createObjectStore('pendingSyncs', { keyPath: 'id' });
      }
    };
  });
}

// Helper function to get pending syncs
function getPendingSyncs(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSyncs'], 'readonly');
    const store = transaction.objectStore('pendingSyncs');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

// Helper function to mark item as synced
function markAsSynced(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingSyncs'], 'readwrite');
    const store = transaction.objectStore('pendingSyncs');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}