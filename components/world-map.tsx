"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Map, Mountain, Trees, Waves, Building2, Tent, Compass, Lock, Trophy, Sparkles } from "lucide-react"
import type { PlayerData } from "@/lib/player-db"

interface WorldMapProps {
  playerData: PlayerData
}

interface Region {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  requiredLevel: number
  completedQuests: number
  totalQuests: number
  specialReward?: string
}

export default function WorldMap({ playerData }: WorldMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)

  const regions: Region[] = [
    {
      id: "forest-trails",
      name: "Forest Trails",
      description: "A peaceful woodland with gentle paths perfect for beginners.",
      icon: Trees,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      requiredLevel: 1,
      completedQuests: 3,
      totalQuests: 5,
    },
    {
      id: "coastal-route",
      name: "Coastal Route",
      description: "Beautiful seaside paths with refreshing ocean breezes.",
      icon: Waves,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      requiredLevel: 5,
      completedQuests: 2,
      totalQuests: 7,
      specialReward: "Coastal Explorer's Hat",
    },
    {
      id: "mountain-pass",
      name: "Mountain Pass",
      description: "Challenging terrain with breathtaking views at the summit.",
      icon: Mountain,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      requiredLevel: 10,
      completedQuests: 0,
      totalQuests: 8,
      specialReward: "Mountaineer's Gear",
    },
    {
      id: "ancient-ruins",
      name: "Ancient Ruins",
      description: "Mysterious structures from a forgotten civilization.",
      icon: Building2,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      requiredLevel: 15,
      completedQuests: 0,
      totalQuests: 6,
      specialReward: "Ancient Artifact",
    },
    {
      id: "enchanted-valley",
      name: "Enchanted Valley",
      description: "A magical place where reality seems to bend.",
      icon: Sparkles,
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
      requiredLevel: 20,
      completedQuests: 0,
      totalQuests: 10,
      specialReward: "Mystical Aura",
    },
    {
      id: "dragons-lair",
      name: "Dragon's Lair",
      description: "The ultimate challenge for only the most dedicated adventurers.",
      icon: Tent,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      requiredLevel: 25,
      completedQuests: 0,
      totalQuests: 3,
      specialReward: "Dragon Scale Armor",
    },
  ]

  const isRegionUnlocked = (region: Region) => {
    return playerData.level >= region.requiredLevel
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-400" />
          World Map
        </h2>
        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/50">
          <Compass className="w-3 h-3 mr-1" />
          {regions.filter((r) => isRegionUnlocked(r)).length}/{regions.length} Regions
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {regions.map((region) => {
          const unlocked = isRegionUnlocked(region)
          return (
            <Card
              key={region.id}
              className={`border-0 ${unlocked ? "bg-white/10" : "bg-white/5"} backdrop-blur-sm cursor-pointer transition-all duration-200 hover:scale-105 ${unlocked ? "hover:bg-white/15" : ""}`}
              onClick={() => unlocked && setSelectedRegion(region)}
            >
              <CardContent className="p-3">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 rounded-full ${region.bgColor} flex items-center justify-center mt-2`}>
                    {unlocked ? (
                      <region.icon className={`w-5 h-5 ${region.color}`} />
                    ) : (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{region.name}</h3>
                    <p className="text-xs text-white/50">
                      {unlocked
                        ? `${region.completedQuests}/${region.totalQuests} Quests`
                        : `Unlocks at Level ${region.requiredLevel}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedRegion && (
        <Card className="border-0 bg-white/10 backdrop-blur-sm mt-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full ${selectedRegion.bgColor} flex items-center justify-center`}
              >
                <selectedRegion.icon className={`w-6 h-6 ${selectedRegion.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{selectedRegion.name}</h3>
                <p className="text-sm text-white/70 mb-2">{selectedRegion.description}</p>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-green-500 h-full rounded-full"
                      style={{ width: `${(selectedRegion.completedQuests / selectedRegion.totalQuests) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white/70">
                    {selectedRegion.completedQuests}/{selectedRegion.totalQuests}
                  </span>
                </div>

                {selectedRegion.specialReward && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-500/10 rounded-lg">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-300">Region Reward: {selectedRegion.specialReward}</span>
                  </div>
                )}

                <Link href={`/adventure/${selectedRegion.id}`}>
                  <Button className="w-full">Explore Region</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

