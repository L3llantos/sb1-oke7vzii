// Mobile-specific utilities for better touch handling

// Detect if the app is running on a mobile device
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Convert touch events to mouse events for canvas interactions
export function handleCanvasTouch(canvas: HTMLCanvasElement, onTap: (x: number, y: number) => void): () => void {
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    onTap(x, y)
  }

  canvas.addEventListener("touchstart", handleTouchStart)

  // Return cleanup function
  return () => {
    canvas.removeEventListener("touchstart", handleTouchStart)
  }
}

// Add pull-to-refresh functionality
export function setupPullToRefresh(element: HTMLElement, onRefresh: () => Promise<void>): () => void {
  let startY = 0
  let isRefreshing = false

  const handleTouchStart = (e: TouchEvent) => {
    startY = e.touches[0].clientY
  }

  const handleTouchMove = async (e: TouchEvent) => {
    if (isRefreshing) return

    const currentY = e.touches[0].clientY
    const diff = currentY - startY

    // If we're at the top of the page and pulling down
    if (window.scrollY === 0 && diff > 70) {
      isRefreshing = true
      await onRefresh()
      isRefreshing = false
    }
  }

  element.addEventListener("touchstart", handleTouchStart)
  element.addEventListener("touchmove", handleTouchMove)

  // Return cleanup function
  return () => {
    element.removeEventListener("touchstart", handleTouchStart)
    element.removeEventListener("touchmove", handleTouchMove)
  }
}

// Optimize animations for mobile
export function optimizeAnimations(isLowPowerMode = false): void {
  if (typeof document === "undefined") return

  // If in low power mode, reduce animations
  if (isLowPowerMode) {
    document.documentElement.style.setProperty("--animation-duration", "0.1s")
    document.documentElement.classList.add("reduce-motion")
  } else {
    document.documentElement.style.setProperty("--animation-duration", "0.2s")
    document.documentElement.classList.remove("reduce-motion")
  }
}

// Handle offline status
export function setupOfflineDetection(onOffline: () => void, onOnline: () => void): () => void {
  const handleOffline = () => {
    onOffline()
  }

  const handleOnline = () => {
    onOnline()
  }

  window.addEventListener("offline", handleOffline)
  window.addEventListener("online", handleOnline)

  // Return cleanup function
  return () => {
    window.removeEventListener("offline", handleOffline)
    window.removeEventListener("online", handleOnline)
  }
}

