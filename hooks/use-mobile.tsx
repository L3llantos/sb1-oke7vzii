"use client"

import { useState, useEffect } from "react"
import { isMobileDevice } from "@/utils/mobile-utils"

interface MobileState {
  isMobile: boolean
  isOnline: boolean
  isLowPowerMode: boolean
  orientation: "portrait" | "landscape"
  vibrate: (pattern: number | number[]) => void
}

export function useMobile(): MobileState {
  const [isMobile, setIsMobile] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  useEffect(() => {
    // Detect mobile device
    setIsMobile(isMobileDevice())

    // Set initial online status
    setIsOnline(navigator.onLine)

    // Set initial orientation
    const updateOrientation = () => {
      if (window.matchMedia("(orientation: portrait)").matches) {
        setOrientation("portrait")
      } else {
        setOrientation("landscape")
      }
    }

    updateOrientation()

    // Event listeners
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    const handleOrientationChange = () => updateOrientation()

    // Try to detect low power mode (iOS only)
    // This is a best effort as there's no standard API
    if ("getBattery" in navigator) {
      // @ts-ignore - getBattery is not in the standard navigator type
      navigator.getBattery().then((battery: any) => {
        setIsLowPowerMode(battery.level < 0.2 && !battery.charging)

        battery.addEventListener("levelchange", () => {
          setIsLowPowerMode(battery.level < 0.2 && !battery.charging)
        })

        battery.addEventListener("chargingchange", () => {
          setIsLowPowerMode(battery.level < 0.2 && !battery.charging)
        })
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  // Vibration function
  const vibrate = (pattern: number | number[]) => {
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  return {
    isMobile,
    isOnline,
    isLowPowerMode,
    orientation,
    vibrate,
  }
}

