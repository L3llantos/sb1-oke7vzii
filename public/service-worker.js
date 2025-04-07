// Service Worker for offline support

const CACHE_NAME = "fitquest-cache-v1"
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/placeholder.svg",
  "/game_assets/Player.png",
  "/game_assets/Female_player.png",
  "/game_assets/goblin.png",
  "/game_assets/skeleton.png",
  "/game_assets/orc.png",
  "/game_assets/slime.png",
  "/game_assets/ghost.png",
  "/game_assets/goblin_boss.png",
  "/game_assets/skeleton_boss.png",
  "/game_assets/orc_boss.png",
  "/game_assets/slime_boss.png",
  "/game_assets/ghost_boss.png",
]

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return

  // Skip Supabase API requests - these should always go to network
  if (event.request.url.includes("supabase.co")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response
      }

      // Clone the request
      const fetchRequest = event.request.clone()

      // Make network request
      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If network fails, try to return a fallback
          if (event.request.url.includes("/game_assets/")) {
            return caches.match("/placeholder.svg")
          }
        })
    }),
  )
})

// Handle background sync for offline activity logging
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-activities") {
    event.waitUntil(syncActivities())
  }
})

// Function to sync offline activities
async function syncActivities() {
  try {
    // Get offline activities from IndexedDB
    const db = await openDatabase()
    const offlineActivities = await getOfflineActivities(db)

    if (offlineActivities.length === 0) {
      return
    }

    // Try to sync each activity
    for (const activity of offlineActivities) {
      try {
        // Attempt to post to server
        const response = await fetch("/api/log-activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(activity),
        })

        if (response.ok) {
          // If successful, remove from offline storage
          await removeOfflineActivity(db, activity.id)
        }
      } catch (error) {
        console.error("Failed to sync activity:", error)
      }
    }
  } catch (error) {
    console.error("Error in syncActivities:", error)
  }
}

// IndexedDB helper functions
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FitQuestOfflineDB", 1)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      db.createObjectStore("offlineActivities", { keyPath: "id" })
    }

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

function getOfflineActivities(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineActivities"], "readonly")
    const store = transaction.objectStore("offlineActivities")
    const request = store.getAll()

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

function removeOfflineActivity(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineActivities"], "readwrite")
    const store = transaction.objectStore("offlineActivities")
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = (event) => {
      reject(event.target.error)
    }
  })
}

