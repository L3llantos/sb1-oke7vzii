"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Mountain, Trees, Waves } from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import { getPlayerData, type PlayerData } from "@/lib/player-db"

interface Region {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  requiredLevel: number
  image: string
  quests: number
  completedQuests: number
}

export default function AdventurePage() {
  const router = useRouter()
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push("/")
          return
        }

        const data = await getPlayerData(user.id)
        if (!data) {
          setError("Failed to load player data")
          return
        }

        setPlayerData(data)

        // In a real app, you would fetch this from an API
        setRegions([
          {
            id: "forest-trails",
            name: "Forest Trails",
            description: "A peaceful woodland with gentle paths perfect for beginners.",
            icon: Trees,
            color: "text-green-400",
            bgColor: "bg-green-500/20",
            requiredLevel: 1,
            image: "/placeholder.svg?height=200&width=400",
            quests: 5,
            completedQuests: 3,
          },
          {
            id: "coastal-route",
            name: "Coastal Route",
            description: "Beautiful seaside paths with refreshing ocean breezes.",
            icon: Waves,
            color: "text-blue-400",
            bgColor: "bg-blue-500/20",
            requiredLevel: 5,
            image: "/placeholder.svg?height=200&width=400",
            quests: 7,
            completedQuests: 2,
          },
          {
            id: "mountain-pass",
            name: "Mountain Pass",
            description: "Challenging terrain with breathtaking views at the summit.",
            icon: Mountain,
            color: "text-orange-400",
            bgColor: "bg-orange-500/20",
            requiredLevel: 10,\

