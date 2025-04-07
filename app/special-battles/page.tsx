"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Swords, Trophy, Shield, Lock, Check, AlertCircle } from "lucide-react"
import { getCurrentUser, getGameAssetUrl } from "@/lib/supabase"
import { getPlayerData, type PlayerData } from "@/lib/player-db"
import {
  SPECIAL_ENEMIES,
  type SpecialEnemy,
  canChallengeEnemy,
  hasDefeatedEnemy,
  recordEnemyDefeat,
  awardSpecialItem,
} from "@/lib/special-enemies"
import { battle } from "@/lib/battle"
import { calculateLevel } from "@/lib/level-system"

export default function SpecialBattlesPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [enemies, setEnemies] = useState<(SpecialEnemy & { available: boolean; defeated: boolean })[]>([])
  const [selectedEnemy, setSelectedEnemy] = useState<SpecialEnemy | null>(null)
  const [battleState, setBattleState] = useState<{
    inProgress: boolean
    playerHealth: number
    enemyHealth: number
    log: string[]
    result: "victory" | "defeat" | null
  }>({
    inProgress: false,
    playerHealth: 100,
    enemyHealth: 100,
    log: [],
    result: null,
  })
  const [playerStats, setPlayerStats] = useState<{ attack: number; defense: number }>({
    attack: 0,
    defense: 0,
  })
  const [loadedImages, setLoadedImages] = useState<{
    player: HTMLImageElement | null
    enemy: HTMLImageElement | null
  }>({
    player: null,
    enemy: null,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/")
        return
      }

      const data = await getPlayerData(user.id)
      if (!data) {
        router.push("/")
        return
      }

      setPlayerData(data)

      // Calculate battle stats
      const attack = Math.round(
        data.stats.strength * 0.4 +
          data.stats.agility * 0.2 +
          data.stats.speed * 0.2 +
          data.stats.reactions * 0.1 +
          data.stats.brainpower * 0.1 +
          5,
      )

      const defense = Math.round(
        data.stats.endurance * 0.4 +
          data.stats.strength * 0.2 +
          data.stats.flexibility * 0.2 +
          data.stats.reactions * 0.1 +
          data.stats.brainpower * 0.1 +
          2,
      )

      setPlayerStats({ attack, defense })

      // Check which enemies are available and which have been defeated
      const enemiesWithStatus = await Promise.all(
        SPECIAL_ENEMIES.map(async (enemy) => {
          const available = await canChallengeEnemy(data, enemy)
          const defeated = await hasDefeatedEnemy(user.id, enemy.id)
          console.log(`Enemy ${enemy.name}: Available: ${available}, Defeated: ${defeated}`)
          return { ...enemy, available, defeated }
        }),
      )

      setEnemies(enemiesWithStatus)

      // Load player image
      if (data.equipped_avatar) {
        try {
          const playerIconUrl = data.equipped_avatar.startsWith("http")
            ? data.equipped_avatar
            : await getGameAssetUrl(data.equipped_avatar)

          const playerImg = new Image()
          playerImg.crossOrigin = "anonymous"
          playerImg.src = playerIconUrl
          playerImg.onload = () => {
            setLoadedImages((prev) => ({ ...prev, player: playerImg }))
          }
        } catch (error) {
          console.error("Error loading player image:", error)
        }
      }
    }

    fetchData()
  }, [router])

  useEffect(() => {
    if (selectedEnemy && canvasRef.current) {
      const loadEnemyImage = async () => {
        try {
          const enemyIconUrl = await getGameAssetUrl(selectedEnemy.image)
          const enemyImg = new Image()
          enemyImg.crossOrigin = "anonymous"
          enemyImg.src = enemyIconUrl
          enemyImg.onload = () => {
            setLoadedImages((prev) => ({ ...prev, enemy: enemyImg }))
          }
        } catch (error) {
          console.error("Error loading enemy image:", error)
        }
      }

      loadEnemyImage()
      drawBattleScene()
    }
  }, [selectedEnemy])

  useEffect(() => {
    if (canvasRef.current && selectedEnemy) {
      drawBattleScene()
    }
  }, [loadedImages, battleState.playerHealth, battleState.enemyHealth])

  const drawBattleScene = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw player
    if (loadedImages.player) {
      ctx.drawImage(loadedImages.player, 50, 75, 50, 50)
    } else {
      // Draw placeholder
      ctx.fillStyle = "#4ade80"
      ctx.beginPath()
      ctx.arc(75, 100, 25, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw enemy
    if (loadedImages.enemy) {
      ctx.drawImage(loadedImages.enemy, 200, 75, 50, 50)
    } else if (selectedEnemy) {
      // Draw placeholder
      ctx.fillStyle = "#f43f5e"
      ctx.beginPath()
      ctx.arc(225, 100, 25, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw health bars
    drawHealthBar(ctx, 50, 140, battleState.playerHealth, "#4ade80")
    if (selectedEnemy) {
      drawHealthBar(ctx, 200, 140, battleState.enemyHealth, "#f43f5e")
    }
  }

  function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, health: number, color: string) {
    const width = 50
    const height = 5

    ctx.fillStyle = "#334155"
    ctx.fillRect(x, y, width, height)

    ctx.fillStyle = color
    ctx.fillRect(x, y, width * (health / 100), height)
  }

  const selectEnemy = (enemy: SpecialEnemy & { available: boolean; defeated: boolean }) => {
    // Check if the enemy is available to challenge
    if (!enemy.available) {
      setError(`You don't meet the requirements to challenge ${enemy.name}. Train more to increase your skills!`)
      return
    }

    // If already defeated, allow viewing but show a message
    if (enemy.defeated) {
      setError(`You've already defeated ${enemy.name} and claimed the reward. You can battle again for practice.`)
    } else {
      setError(null)
    }

    setSelectedEnemy(enemy)
    setBattleState({
      inProgress: false,
      playerHealth: 100,
      enemyHealth: 100,
      log: [],
      result: null,
    })
  }

  const startBattle = async () => {
    if (!selectedEnemy || !playerData) return

    setBattleState((prev) => ({
      ...prev,
      inProgress: true,
      playerHealth: 100,
      enemyHealth: 100,
      log: ["Battle started!"],
      result: null,
    }))

    // Run the battle turn by turn
    await runBattleTurns()
  }

  const runBattleTurns = async () => {
    if (!selectedEnemy || !playerData) return

    let currentPlayerHealth = 100
    let currentEnemyHealth = selectedEnemy.stats.health
    const battleLog: string[] = ["Battle started!"]
    let turnCount = 0
    const maxTurns = 20 // Safety to prevent infinite loops

    while (currentPlayerHealth > 0 && currentEnemyHealth > 0 && turnCount < maxTurns) {
      // Wait a bit between turns for animation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Run a battle turn
      const result = battle(
        playerStats,
        {
          name: selectedEnemy.name,
          health: selectedEnemy.stats.health,
          attack: selectedEnemy.stats.attack,
          defense: selectedEnemy.stats.defense,
          isBoss: true,
          icon: selectedEnemy.image,
        },
        currentPlayerHealth,
        currentEnemyHealth,
      )

      currentPlayerHealth = result.playerHealth
      currentEnemyHealth = result.monsterHealth

      // Add to battle log
      battleLog.push(`You deal ${result.playerDamageDealt} damage to ${selectedEnemy.name}!`)
      battleLog.push(`${selectedEnemy.name} deals ${result.monsterDamageDealt} damage to you!`)

      // Update battle state
      setBattleState((prev) => ({
        ...prev,
        playerHealth: (currentPlayerHealth / 100) * 100, // Convert to percentage
        enemyHealth: (currentEnemyHealth / selectedEnemy.stats.health) * 100, // Convert to percentage
        log: [...battleLog],
      }))

      turnCount++
    }

    // Determine battle result
    if (currentPlayerHealth <= 0) {
      battleLog.push(`You were defeated by ${selectedEnemy.name}!`)
      setBattleState((prev) => ({
        ...prev,
        inProgress: false,
        log: battleLog,
        result: "defeat",
      }))
    } else if (currentEnemyHealth <= 0) {
      battleLog.push(`You defeated ${selectedEnemy.name}!`)
      setBattleState((prev) => ({
        ...prev,
        inProgress: false,
        log: battleLog,
        result: "victory",
      }))

      // Handle victory rewards
      if (playerData) {
        const user = await getCurrentUser()
        if (user) {
          // Record the victory
          await recordEnemyDefeat(user.id, selectedEnemy.id)

          // Award the special item
          const success = await awardSpecialItem(user.id, selectedEnemy.id, playerData)

          if (success) {
            battleLog.push(`You received ${selectedEnemy.reward.name}!`)
            setBattleState((prev) => ({
              ...prev,
              log: battleLog,
            }))

            // Update the enemies list to mark this one as defeated
            setEnemies((prev) => prev.map((e) => (e.id === selectedEnemy.id ? { ...e, defeated: true } : e)))

            // Refresh player data to include the new item
            const updatedPlayerData = await getPlayerData(user.id)
            if (updatedPlayerData) {
              setPlayerData(updatedPlayerData)
            }
          }
        }
      }
    }
  }

  // Helper function to check if a skill requirement is met
  const isRequirementMet = (skill: string, requiredLevel: number): boolean => {
    if (!playerData) return false

    const skillXp = playerData.stats[skill.toLowerCase() as keyof typeof playerData.stats] || 0
    const playerLevel = calculateLevel(skillXp)

    return playerLevel >= requiredLevel
  }

  if (!playerData) {
    return (
      <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container px-4 py-6 mx-auto max-w-md">
          <p className="text-center">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container px-4 py-6 mx-auto max-w-md">
        <header className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Special Battles</h1>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">
              {enemies.filter((e) => e.defeated).length}/{enemies.length} Defeated
            </span>
          </div>
        </header>

        {error && (
          <Card className="mb-4 border-0 bg-red-500/10 backdrop-blur-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </CardContent>
          </Card>
        )}

        {selectedEnemy ? (
          <>
            <Card className="mb-4 border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedEnemy(null)
                      setError(null)
                    }}
                    disabled={battleState.inProgress}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <h2 className="text-lg font-semibold">{selectedEnemy.name}</h2>
                </div>

                <canvas ref={canvasRef} width={300} height={200} className="w-full rounded-lg bg-slate-800 mb-4" />

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Your Stats</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Swords className="w-4 h-4 text-red-400" />
                      <span>Attack: {playerStats.attack}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Defense: {playerStats.defense}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Enemy Stats</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <Swords className="w-4 h-4 text-red-400" />
                      <span>Attack: {selectedEnemy.stats.attack}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span>Defense: {selectedEnemy.stats.defense}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Reward</h3>
                  <div className="p-3 bg-yellow-500/20 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{selectedEnemy.reward.name}</p>
                      <p className="text-xs text-white/70">{selectedEnemy.reward.description}</p>
                    </div>
                  </div>
                </div>

                {!battleState.inProgress && battleState.result === null && (
                  <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" onClick={startBattle}>
                    Start Battle
                  </Button>
                )}

                {battleState.inProgress && (
                  <div className="text-center">
                    <p className="text-sm mb-2">Battle in progress...</p>
                    <Progress value={battleState.enemyHealth} className="mb-2" />
                  </div>
                )}

                {battleState.result === "victory" && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400 mb-2">Victory!</p>
                    <p className="text-sm mb-4">
                      You defeated {selectedEnemy.name} and earned {selectedEnemy.reward.name}!
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                      onClick={() => setSelectedEnemy(null)}
                    >
                      Return to Enemy Selection
                    </Button>
                  </div>
                )}

                {battleState.result === "defeat" && (
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400 mb-2">Defeat!</p>
                    <p className="text-sm mb-4">
                      You were defeated by {selectedEnemy.name}. Train harder and try again!
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-red-500 to-orange-600"
                      onClick={() => {
                        setBattleState({
                          inProgress: false,
                          playerHealth: 100,
                          enemyHealth: 100,
                          log: [],
                          result: null,
                        })
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Battle Log</h3>
                <div className="h-40 overflow-y-auto bg-black/20 p-2 rounded text-sm">
                  {battleState.log.map((entry, index) => (
                    <p key={index} className="mb-1">
                      {entry}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-4">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Special Enemies</h2>
                <p className="text-sm text-white/70 mb-4">
                  Challenge these powerful foes to earn unique rewards! Each enemy requires specific skill levels to
                  challenge.
                </p>
              </CardContent>
            </Card>

            {enemies.map((enemy) => (
              <Card
                key={enemy.id}
                className={`border-0 ${
                  enemy.defeated ? "bg-green-500/10" : enemy.available ? "bg-white/10" : "bg-white/5"
                } backdrop-blur-sm`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${
                        enemy.defeated ? "bg-green-500/20" : enemy.available ? "bg-yellow-500/20" : "bg-gray-500/20"
                      }`}
                    >
                      {enemy.defeated ? (
                        <Check className="w-6 h-6 text-green-400" />
                      ) : enemy.available ? (
                        <Swords className="w-6 h-6 text-yellow-400" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{enemy.name}</h3>
                        {enemy.defeated && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Defeated
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-white/70">{enemy.description}</p>

                      <div className="mt-2">
                        <h4 className="text-xs font-medium mb-1">Requirements:</h4>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(enemy.requirements).map(([skill, requiredLevel]) => {
                            // Calculate the actual player level for this skill using our new level system
                            const skillXp = playerData.stats[skill.toLowerCase() as keyof typeof playerData.stats] || 0
                            const playerLevel = calculateLevel(skillXp)
                            const isMet = playerLevel >= requiredLevel

                            return (
                              <div
                                key={skill}
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  isMet ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {skill}: {requiredLevel} {isMet ? "✓" : `(${playerLevel})`}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div className="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-full ${!enemy.available ? "opacity-50" : ""}`}
                          disabled={!enemy.available}
                          onClick={() => selectEnemy(enemy)}
                        >
                          {enemy.defeated ? "Battle Again" : enemy.available ? "Challenge" : "Requirements Not Met"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

