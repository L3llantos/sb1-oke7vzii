"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Trophy, Check } from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import { checkAllAchievements } from "@/lib/achievement-checker"

export default function CheckAchievementsPage() {
  const [isChecking, setIsChecking] = useState(false)
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setUserId(user.id)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
        setError("Failed to fetch user. Please try again.")
      }
    }

    fetchUser()
  }, [])

  const handleCheckAchievements = async () => {
    if (!userId) {
      setError("User not found. Please log in.")
      return
    }

    setIsChecking(true)
    setError(null)
    setUnlockedAchievements([])

    try {
      const achievements = await checkAllAchievements(userId)
      setUnlockedAchievements(achievements)

      if (achievements.length === 0) {
        setError("No new achievements unlocked.")
      }
    } catch (error) {
      console.error("Error checking achievements:", error)
      setError("An error occurred while checking achievements.")
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container px-4 py-6 mx-auto max-w-md">
        <header className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Achievement Checker</h1>
        </header>

        <Card className="border-0 bg-white/10 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <p className="mb-4">
              This tool will check all your activities and stats to unlock any achievements you've earned but haven't
              received yet.
            </p>
            <Button
              onClick={handleCheckAchievements}
              disabled={isChecking || !userId}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              {isChecking ? "Checking..." : "Check Achievements"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-0 bg-red-500/10 backdrop-blur-sm mb-6">
            <CardContent className="p-4">
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {unlockedAchievements.length > 0 && (
          <Card className="border-0 bg-green-500/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Unlocked Achievements
              </h2>
              <div className="space-y-2">
                {unlockedAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center p-2 bg-white/5 rounded-lg">
                    <Check className="w-4 h-4 mr-2 text-green-400" />
                    <span>{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

