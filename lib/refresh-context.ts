"use client"

import type React from "react"

import { createContext, useContext, useState, useCallback } from "react"

type RefreshContextType = {
  refreshTrigger: number
  triggerRefresh: () => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export function useRefreshContext() {
  const context = useContext(RefreshContext)
  if (context === undefined) {
    throw new Error("useRefreshContext must be used within a RefreshProvider")
  }
  return context
}

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1)
  }, [])

  return <RefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>{children}</RefreshContext.Provider>
}

