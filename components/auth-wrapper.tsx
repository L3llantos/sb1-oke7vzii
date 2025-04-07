"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Auth } from "@/components/Auth"

// Pages that don't require authentication
const publicPages = ["/login", "/register"]

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        setIsAuthenticated(!!user)

        // If not authenticated and not on a public page, show auth
        if (!user && !publicPages.includes(pathname)) {
          setShowAuth(true)
        } else {
          setShowAuth(false)
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setIsAuthenticated(false)
        setShowAuth(true)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true)
    setShowAuth(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <p>Loading...</p>
      </div>
    )
  }

  if (showAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <Card className="border-0 bg-white/10 backdrop-blur-sm w-[350px]">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-center">Welcome to FitQuest</h2>
            <p className="text-white/70 mb-6 text-center">Please log in to continue your fitness adventure.</p>
            <Auth onAuth={handleSuccessfulAuth} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}

