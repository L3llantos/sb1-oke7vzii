"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Map, Utensils, Brain, Book, Flame, RefreshCw } from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import { getPlayerData, type PlayerData } from "@/lib/player-db"
import { RefreshProvider, useRefreshContext } from "@/lib/refresh-context"
import PlayerStats from "@/components/player-stats"
import ActivityLog from "@/components/activity-log"
import WorldMap from "@/components/world-map"
import DailyRewards from "@/components/daily-rewards"
import { OfflineBanner } from "@/components/offline-banner"

// Wrap the entire app in the RefreshProvider
export default function Home() {
  return (
    <RefreshProvider>
      <HomeContent />
    </RefreshProvider>
  )
}

// Move all the component logic to a separate component that's inside the provider
function HomeContent() {
  const [user, setUser] = useState<any>(null)
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("world")
  const { refreshTrigger, triggerRefresh } = useRefreshContext()

  const fetchData = async () => {
    setIsRefreshing(true)
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        const data = await getPlayerData(currentUser.id)
        if (data) {
          setPlayerData(data)
        } else {
          setError("Failed to load player data")
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load data. Please try again.")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        <Card className="border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Welcome to FitQuest</h2>
            <p className="text-white/70 mb-4">Please log in to continue your fitness adventure.</p>
            <Button className="w-full">Log In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <Card className="border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Error</h2>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <Card className="border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Loading...</h2>
            <p>Please wait while we load your game data.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <OfflineBanner />
      <div className="container px-4 py-6 pb-24 mx-auto max-w-md">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">FitQuest</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-500/20 rounded-full text-amber-300">
              <Flame className="w-3 h-3" />
              <span>Level {playerData.level}</span>
            </div>
            <RefreshButton isRefreshing={isRefreshing} onRefresh={fetchData} />
          </div>
        </header>

        <Card className="mb-6 border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <DailyRewards playerData={playerData} />
          </CardContent>
        </Card>

        <Tabs defaultValue="world" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="world" className="flex flex-col items-center gap-1 py-2">
              <Map className="w-4 h-4" />
              <span className="text-xs">World</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex flex-col items-center gap-1 py-2">
              <Utensils className="w-4 h-4" />
              <span className="text-xs">Nutrition</span>
            </TabsTrigger>
            <TabsTrigger value="mind" className="flex flex-col items-center gap-1 py-2">
              <Brain className="w-4 h-4" />
              <span className="text-xs">Mind</span>
            </TabsTrigger>
            <TabsTrigger value="journal" className="flex flex-col items-center gap-1 py-2">
              <Book className="w-4 h-4" />
              <span className="text-xs">Journal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="world" className="mt-4">
            <WorldMap playerData={playerData} />
          </TabsContent>

          <TabsContent value="nutrition" className="mt-4">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Nutrition Center</h2>
                <p className="text-sm text-white/70 mb-4">
                  Track your meals, discover recipes, and earn bonuses for healthy eating.
                </p>
                <Link href="/nutrition">
                  <Button className="w-full">Enter Nutrition Center</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mind" className="mt-4">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Mindfulness Sanctuary</h2>
                <p className="text-sm text-white/70 mb-4">
                  Practice meditation, breathing exercises, and mental wellness activities.
                </p>
                <Link href="/mindfulness">
                  <Button className="w-full">Enter Sanctuary</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="journal" className="mt-4">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Adventure Journal</h2>
                <p className="text-sm text-white/70 mb-4">
                  Record your thoughts, track your progress, and reflect on your journey.
                </p>
                <Link href="/journal">
                  <Button className="w-full">Open Journal</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {playerData && (
          <PlayerStats stats={playerData.stats} userId={user?.id} userEmail={user?.email} playerData={playerData} />
        )}

        <ActivityLog />

        <div className="fixed inset-x-0 bottom-0 p-4 bg-slate-900/80 backdrop-blur-md">
          <Link href="/log-activity">
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              Log New Activity
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

// Separate component for the refresh button
function RefreshButton({ isRefreshing, onRefresh }: { isRefreshing: boolean; onRefresh: () => void }) {
  const { triggerRefresh } = useRefreshContext()

  const handleRefresh = () => {
    triggerRefresh()
    onRefresh()
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="text-blue-400 hover:text-blue-300"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </Button>
  )
}

