"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Dumbbell, Zap, Flame, Activity, Brain, Utensils, BookOpen, ArrowRight, Star } from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import { getPlayerData, type PlayerData } from "@/lib/player-db"
import { calculateLevel, calculateLevelProgress } from "@/lib/level-system"
import DailyTasksPanel from "@/components/daily-tasks-panel"
import WorldMap from "@/components/world-map"
import DailyRewards from "@/components/daily-rewards"
import { useMobile } from "@/hooks/use-mobile"

export default function HomeRedesign() {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeQuest, setActiveQuest] = useState<any | null>(null)
  const [dailyStreak, setDailyStreak] = useState(0)
  const { isMobile, vibrate } = useMobile()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const user = await getCurrentUser()
        if (user) {
          const data = await getPlayerData(user.id)
          if (data) {
            setPlayerData(data)

            // Fetch active quest data
            // This would come from your quest system
            setActiveQuest({
              id: "forest-1",
              name: "The Ancient Forest",
              progress: 65,
              region: "Evergreen Valley",
              reward: "Forest Guardian's Amulet",
            })

            // Get daily streak
            // This would come from your streak tracking system
            setDailyStreak(7)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-slate-700 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-32 bg-slate-700 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-4">Welcome to FitQuest</h2>
            <p className="mb-4">Please sign in to start your adventure</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate overall level
  const overallLevel = playerData.level || 1
  const levelProgress = calculateLevelProgress(playerData.xp)

  return (
    <div className="container px-4 py-6 mx-auto max-w-md">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">FitQuest</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/20 rounded-full text-amber-300">
              <Star className="w-3 h-3" />
              <span>Level {overallLevel}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-emerald-500/20 rounded-full text-emerald-300">
              <Flame className="w-3 h-3" />
              <span>{dailyStreak} Day Streak</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-slate-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-400">Overall Level</span>
            <span className="text-xs text-slate-400">Level {overallLevel}</span>
          </div>
          <Progress value={levelProgress} className="h-2" />

          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs">{playerData.xp.toLocaleString()} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs">{playerData.gold.toLocaleString()} Gold</span>
            </div>
          </div>
        </div>
      </header>

      {/* Daily Rewards */}
      <DailyRewards streak={dailyStreak} />

      {/* Active Quest */}
      {activeQuest && (
        <Card className="mb-6 border-0 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-semibold">Active Quest</h2>
              <span className="text-xs text-indigo-300">{activeQuest.region}</span>
            </div>

            <h3 className="text-lg font-bold mb-2">{activeQuest.name}</h3>

            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400">Progress</span>
                <span className="text-xs text-slate-400">{activeQuest.progress}%</span>
              </div>
              <Progress value={activeQuest.progress} className="h-2" />
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-xs">{activeQuest.reward}</span>
              </div>

              <Link href={`/adventure/forest/forest-1`}>
                <Button size="sm" variant="outline" className="text-xs">
                  Continue
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* World Map Preview */}
      <Card className="mb-6 border-0 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 pb-0">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Adventure Map</h2>
              <Link href="/adventure">
                <Button size="sm" variant="ghost" className="text-xs">
                  View All
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="h-48 relative">
            <WorldMap compact />
          </div>
        </CardContent>
      </Card>

      {/* Daily Tasks */}
      <Card className="mb-6 border-0 bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <DailyTasksPanel />
        </CardContent>
      </Card>

      {/* Quick Access */}
      <h2 className="text-lg font-semibold mb-3">Quick Access</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <QuickAccessCard
          href="/log-activity"
          icon={Dumbbell}
          title="Log Activity"
          description="Record your workouts"
          color="from-red-900/30 to-orange-900/30"
          iconColor="text-red-400"
        />

        <QuickAccessCard
          href="/nutrition"
          icon={Utensils}
          title="Nutrition"
          description="Track meals & recipes"
          color="from-green-900/30 to-emerald-900/30"
          iconColor="text-green-400"
        />

        <QuickAccessCard
          href="/mindfulness"
          icon={Brain}
          title="Mindfulness"
          description="Meditation & focus"
          color="from-purple-900/30 to-indigo-900/30"
          iconColor="text-purple-400"
        />

        <QuickAccessCard
          href="/journal"
          icon={BookOpen}
          title="Journal"
          description="Reflect & track progress"
          color="from-blue-900/30 to-sky-900/30"
          iconColor="text-blue-400"
        />
      </div>

      {/* Skill Levels */}
      <h2 className="text-lg font-semibold mb-3">Your Skills</h2>
      <Card className="border-0 bg-slate-800/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <SkillCard
              name="Strength"
              value={playerData.stats.strength}
              icon={Dumbbell}
              color="bg-red-500/20"
              textColor="text-red-400"
            />

            <SkillCard
              name="Agility"
              value={playerData.stats.agility}
              icon={Zap}
              color="bg-yellow-500/20"
              textColor="text-yellow-400"
            />

            <SkillCard
              name="Endurance"
              value={playerData.stats.endurance}
              icon={Flame}
              color="bg-orange-500/20"
              textColor="text-orange-400"
            />

            <SkillCard
              name="Flexibility"
              value={playerData.stats.flexibility}
              icon={Activity}
              color="bg-green-500/20"
              textColor="text-green-400"
            />

            <SkillCard
              name="Reactions"
              value={playerData.stats.reactions}
              icon={Zap}
              color="bg-purple-500/20"
              textColor="text-purple-400"
            />

            <SkillCard
              name="Brainpower"
              value={playerData.stats.brainpower}
              icon={Brain}
              color="bg-indigo-500/20"
              textColor="text-indigo-400"
            />
          </div>

          <Link href="/skills">
            <Button variant="outline" size="sm" className="w-full mt-4">
              View Skill Details
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

interface QuickAccessCardProps {
  href: string
  icon: React.ElementType
  title: string
  description: string
  color: string
  iconColor: string
}

function QuickAccessCard({ href, icon: Icon, title, description, color, iconColor }: QuickAccessCardProps) {
  return (
    <Link href={href}>
      <Card className={`border-0 bg-gradient-to-br ${color} hover:bg-opacity-75 transition-all duration-200 h-full`}>
        <CardContent className="p-4 flex flex-col h-full">
          <div className={`w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center mb-2`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-xs text-slate-300 mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

interface SkillCardProps {
  name: string
  value: number
  icon: React.ElementType
  color: string
  textColor: string
}

function SkillCard({ name, value, icon: Icon, color, textColor }: SkillCardProps) {
  const level = calculateLevel(value)
  const progress = calculateLevelProgress(value)

  return (
    <div className="bg-slate-700/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${textColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-slate-400">Level {level}</p>
        </div>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  )
}

