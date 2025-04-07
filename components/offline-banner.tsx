"use client"

import { useState, useEffect } from "react"
import { Wifi, WifiOff } from "lucide-react"

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Show banner if offline
    if (!navigator.onLine) {
      setShowBanner(true)
    }

    const handleOnline = () => {
      setIsOnline(true)

      // Hide banner after a delay
      setTimeout(() => {
        setShowBanner(false)
      }, 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showBanner) {
    return null
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 p-2 text-center text-sm font-medium transition-colors duration-300 ${
        isOnline ? "bg-green-500/90 text-white" : "bg-red-500/90 text-white"
      }`}
    >
      {isOnline ? (
        <div className="flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          <span>Back online! Syncing your data...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          <span>You're offline. Your activities will be saved locally.</span>
        </div>
      )}
    </div>
  )
}

