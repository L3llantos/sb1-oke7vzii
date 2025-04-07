// Utility for offline data storage using IndexedDB

interface OfflineActivity {
  id: string
  userId: string
  name: string
  duration: number
  intensity: number
  xp_gained: Record<string, number>
  created_at: string
}

// Open the database
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FitQuestOfflineDB", 1)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains("offlineActivities")) {
        db.createObjectStore("offlineActivities", { keyPath: "id" })
      }

      if (!db.objectStoreNames.contains("playerData")) {
        db.createObjectStore("playerData", { keyPath: "id" })
      }
    }

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result)
    }

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

// Save activity for offline use
export async function saveOfflineActivity(activity: OfflineActivity): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineActivities"], "readwrite")
    const store = transaction.objectStore("offlineActivities")

    // Add timestamp if not present
    if (!activity.created_at) {
      activity.created_at = new Date().toISOString()
    }

    // Add unique ID if not present
    if (!activity.id) {
      activity.id = crypto.randomUUID()
    }

    const request = store.add(activity)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error)
    }
  })
}

// Get all offline activities
export async function getOfflineActivities(): Promise<OfflineActivity[]> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["offlineActivities"], "readonly")
    const store = transaction.objectStore("offlineActivities")
    const request = store.getAll()

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result)
    }

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error)
    }
  })
}

// Save player data for offline use
export async function savePlayerDataOffline(playerData: any): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["playerData"], "readwrite")
    const store = transaction.objectStore("playerData")

    // Add last updated timestamp
    playerData.lastUpdated = new Date().toISOString()

    const request = store.put(playerData)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error)
    }
  })
}

// Get player data from offline storage
export async function getOfflinePlayerData(playerId: string): Promise<any | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["playerData"], "readonly")
    const store = transaction.objectStore("playerData")
    const request = store.get(playerId)

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result || null)
    }

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error)
    }
  })
}

// Request background sync when online
export function requestBackgroundSync(): void {
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register("sync-activities").catch((err) => {
        console.error("Background sync registration failed:", err)
      })
    })
  }
}

