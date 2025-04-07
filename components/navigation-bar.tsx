"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Map, Dumbbell, Users, Utensils, Brain, BookOpen, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

export function NavigationBar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems: NavItem[] = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/adventure", icon: Map, label: "Adventure" },
    { href: "/log-activity", icon: Dumbbell, label: "Activity" },
    { href: "/nutrition", icon: Utensils, label: "Nutrition" },
    { href: "/mindfulness", icon: Brain, label: "Mindfulness" },
    { href: "/journal", icon: BookOpen, label: "Journal" },
    { href: "/social", icon: Users, label: "Social" }, // Updated label from "Friends" to "Social"
    { href: "/settings", icon: Settings, label: "Settings" },
  ]

  if (!mounted) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-800/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-700/50">
      <div className="flex justify-between items-center px-2 py-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                isActive ? "text-primary bg-primary/10" : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/30",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

