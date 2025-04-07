"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Gift, Check, Calendar, Trophy, Sparkles } from "lucide-react"
import type { PlayerData } from "@/lib/player-db"
import { updatePlayerData } from "@/lib/player-db"
import { useRefreshContext } from "@/lib/refresh-context"

interface DailyRewardsProps {
  playerData: PlayerData
}

interface Reward {
  day: number
  xp: number
  gold: number
  special?: string
}

export default function DailyRewards({ playerData }: DailyRewardsProps) {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null)
  const [canClaim, setCanClaim] = useState(false)
  const [claimingReward, setClaimingReward] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [currentReward, setCurrentReward] = useState<Reward | null>(null)
  const { triggerRefresh } = useRefreshContext()

  const rewards: Reward[] = [
    { day: 1, xp: 50, gold: 25 },
    { day: 2, xp: 75, gold: 50 },
    { day: 3, xp: 100, gold: 75 },
    { day: 4, xp: 125, gold: 100 },
    { day: 5, xp: 150, gold: 125 },
    { day: 6, xp: 175, gold: 150 },
    { day: 7, xp: 300, gold: 300, special: "Weekly Treasure Chest" },
  ]

  useEffect(() => {
    if (playerData) {
      // Get streak data from player
      setCurrentStreak(playerData.daily_streak || 0)
      setLastClaimDate(playerData.last_daily_claim || null)

      // Check if player can claim today's reward
      const today = new Date().toISOString().split("T")[0]
      const canClaimToday = lastClaimDate !== today
      setCanClaim(canClaimToday)

      // Set current reward based on streak
      const nextDay = (currentStreak % 7) + 1
      setCurrentReward(rewards.find((r) => r.day === nextDay) || rewards[0])
    }
  }, [playerData])

  const claimDailyReward = async () => {
    if (!canClaim || !playerData || !currentReward) return

    setClaimingReward(true)

    try {
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

      // Check if streak should continue or reset
      let newStreak = currentStreak
      if (lastClaimDate === yesterday) {
        // Continuing streak
        newStreak += 1
      } else {
        // Broken streak, start over
        newStreak = 1
      }

      // Update player data with rewards
      const updatedPlayerData = {
        ...playerData,
        xp: playerData.xp + currentReward.xp,
        gold: playerData.gold + currentReward.gold,
        daily_streak: newStreak,
        last_daily_claim: today,
      }

      // If there's a special reward, add it to inventory
      if (currentReward.special) {
        // This would need proper implementation based on your inventory system
        console.log(`Adding special reward: ${currentReward.special}`)
      }

      // Save to database
      await updatePlayerData(playerData.id, updatedPlayerData)

      // Show reward animation
      setShowReward(true)
      setTimeout(() => {
        setShowReward(false)
        setCanClaim(false)
        setCurrentStreak(newStreak)
        setLastClaimDate(today)
        triggerRefresh() // Refresh the app data
      }, 3000)
    } catch (error) {
      console.error("Error claiming daily reward:", error)
    } finally {
      setClaimingReward(false)
    }
  }

  if (!currentReward) return null

  return (
    <div className="relative">
      {showReward && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10 animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-yellow-500/30 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Daily Reward!</h3>
            <p className="text-sm text-white/80 mb-3">Day {currentStreak} Streak</p>
            <div className="flex justify-center gap-4 mb-2">
              <div className="flex flex-col items-center">
                <Trophy className="w-5 h-5 text-yellow-400 mb-1" />
                <span className="text-sm font-bold text-yellow-300">+{currentReward.xp} XP</span>
              </div>
              <div className="flex flex-col items-center">
                <Sparkles className="w-5 h-5 text-yellow-400 mb-1" />
                <span className="text-sm font-bold text-yellow-300">+{currentReward.gold} Gold</span>
              </div>
            </div>
            {currentReward.special && (
              <div className="mt-2 p-2 bg-purple-500/20 rounded-lg">
                <p className="text-sm text-purple-300">+ {currentReward.special}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-yellow-400" />
          <h3 className="text-sm font-medium">Daily Rewards</h3>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-white/70">Day {currentStreak}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {rewards.map((reward, index) => {
          const day = index + 1
          const isToday = (currentStreak % 7) + 1 === day
          const isPast = currentStreak > 0 && (currentStreak % 7 >= day || currentStreak > 7)

          return (
            <div
              key={day}
              className={`relative h-8 rounded-md flex items-center justify-center ${
                isToday ? "bg-yellow-500/30 border border-yellow-500/50" : isPast ? "bg-green-500/20" : "bg-white/10"
              }`}
            >
              <span className="text-xs">{day}</span>
              {isPast && <Check className="absolute w-3 h-3 text-green-400 -top-1 -right-1" />}
              {reward.special && <Gift className="absolute w-3 h-3 text-purple-400 -bottom-1 -right-1" />}
            </div>
          )
        })}
      </div>

      <Button
        className={`w-full ${canClaim ? "bg-gradient-to-r from-yellow-500 to-amber-600" : "bg-white/10 text-white/50"}`}
        disabled={!canClaim || claimingReward}
        onClick={claimDailyReward}
      >
        {claimingReward
          ? "Claiming..."
          : canClaim
            ? `Claim Day ${(currentStreak % 7) + 1} Reward`
            : "Already Claimed Today"}
      </Button>
    </div>
  )
}

