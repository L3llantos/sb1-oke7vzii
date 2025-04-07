"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Achievement, type UserAchievement, getAchievements, getUserAchievements } from "@/lib/achievement-db"
import { getCurrentUser } from "@/lib/supabase"
import {
  Dumbbell,
  Footprints,
  Clock,
  Zap,
  SpaceIcon as Yoga,
  Target,
  Brain,
  Calendar,
  HeartPulse,
  StretchVerticalIcon as Stretch,
  Repeat,
  Grip,
  TrendingUp,
  Flame,
  StepBackIcon as Stairs,
  Move,
  Swords,
  Gauge,
  ArrowUp,
  Heart,
  Mountain,
  Route,
  Timer,
  Sun,
  BoxIcon as Boxing,
  CircleDot,
  Shield,
  Eye,
} from "lucide-react"

const iconMap: { [key: string]: React.ElementType } = {
  Dumbbell,
  Footprints,
  Clock,
  Zap,
  Yoga,
  Target,
  Brain,
  Calendar,
  HeartPulse,
  Stretch,
  Repeat,
  Grip,
  TrendingUp,
  Flame,
  Stairs,
  Move,
  Swords,
  Gauge,
  ArrowUp,
  Heart,
  Mountain,
  Route,
  Timer,
  Sun,
  Boxing,
  CircleDot,
  Shield,
  Eye,
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const allAchievements = await getAchievements()
      setAchievements(allAchievements)

      const user = await getCurrentUser()
      if (user) {
        const userAchievs = await getUserAchievements(user.id)
        setUserAchievements(userAchievs)
      }
    }

    fetchData()
  }, [])

  const categories = ["All", ...new Set(achievements.map((a) => a.category))]

  return (
    <Card className="border-0 bg-white/10 backdrop-blur-sm h-full">
      <CardContent className="p-4 h-full">
        <h2 className="text-lg font-semibold mb-4">Achievements</h2>
        <Tabs defaultValue="All" className="h-full">
          <TabsList className="grid grid-cols-4 grid-rows-2 gap-2 mb-4 bg-white/5">
            <TabsTrigger value="All" className="text-xs data-[state=active]:bg-white/10">
              All
            </TabsTrigger>
            <TabsTrigger value="Strength" className="text-xs data-[state=active]:bg-white/10">
              Strength
            </TabsTrigger>
            <TabsTrigger value="Agility" className="text-xs data-[state=active]:bg-white/10">
              Agility
            </TabsTrigger>
            <TabsTrigger value="Endurance" className="text-xs data-[state=active]:bg-white/10">
              Endurance
            </TabsTrigger>
            <TabsTrigger value="Speed" className="text-xs data-[state=active]:bg-white/10">
              Speed
            </TabsTrigger>
            <TabsTrigger value="Flexibility" className="text-xs data-[state=active]:bg-white/10">
              Flexibility
            </TabsTrigger>
            <TabsTrigger value="Reaction" className="text-xs data-[state=active]:bg-white/10">
              Reaction
            </TabsTrigger>
            <TabsTrigger value="Brainpower" className="text-xs data-[state=active]:bg-white/10">
              Brainpower
            </TabsTrigger>
          </TabsList>
          {categories.map((category) => (
            <TabsContent
              key={category}
              value={category}
              className="bg-white/5 rounded-lg p-3 min-h-[calc(100vh-16rem)]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements
                  .filter((a) => category === "All" || a.category === category)
                  .map((achievement) => {
                    const Icon = iconMap[achievement.icon] || Dumbbell
                    const isUnlocked = userAchievements.some((ua) => ua.achievement_id === achievement.id)
                    return (
                      <div
                        key={achievement.id}
                        className={`p-3 rounded-lg ${isUnlocked ? "bg-green-500/20" : "bg-white/10"}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isUnlocked ? "bg-green-500/20" : "bg-white/10"}`}>
                            <Icon className={`w-5 h-5 ${isUnlocked ? "text-green-400" : "text-white/70"}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium">{achievement.name}</h3>
                            <p className="text-xs text-white/70">{achievement.description}</p>
                            <p className="text-xs text-yellow-400 mt-1">XP Reward: {achievement.xp_reward}</p>
                          </div>
                          {isUnlocked && (
                            <div className="text-green-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

