"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Swords, Pause, Play, FastForward, ShoppingBag } from "lucide-react"
import { getPlayerData, updatePlayerData, type PlayerData } from "@/lib/player-db"
import { type Monster, createMonster, createBoss } from "@/lib/monster"
import { battle } from "@/lib/battle"
import Shop from "@/components/shop"
import { getCurrentUser, getGameAssetUrl } from "@/lib/supabase"
import CharacterCustomization from "@/components/CharacterCustomization"
import { monsterTypes } from "@/lib/monster-db"

export default function AutoBattlerPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const loadedImagesRef = useRef<{
    player: HTMLImageElement | null
    hat: HTMLImageElement | null
    monsters: Record<string, HTMLImageElement>
  }>({
    player: null,
    hat: null,
    monsters: {},
  })
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [wave, setWave] = useState(1)
  const [monster, setMonster] = useState<Monster | null>(null)
  const [playerHealth, setPlayerHealth] = useState(100)
  const [monsterHealth, setMonsterHealth] = useState(100)
  const [gameStatus, setGameStatus] = useState<"loading" | "fighting" | "paused" | "lost">("loading")
  const [reward, setReward] = useState({ xp: 0, gold: 0 })
  const [speed, setSpeed] = useState<1 | 2>(1)
  const [showShop, setShowShop] = useState(false)
  const [playerIconUrl, setPlayerIconUrl] = useState("")
  const [monsterIconUrls, setMonsterIconUrls] = useState<Record<string, string>>({})
  const [stats, setStats] = useState<{ attack: number; defense: number }>({
    attack: 10,
    defense: 5,
  })
  const [showCustomization, setShowCustomization] = useState(false)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  // Add this new function to check if customization is allowed
  const isCustomizationAllowed = () => {
    return gameStatus === "paused" || gameStatus === "lost"
  }

  // Improve the preloadAllImages function for better mobile performance

  // Add a more efficient image loading system with progress tracking
  const preloadAllImages = async () => {
    console.log("Preloading all images")
    setGameStatus("loading")

    const totalImagesToLoad = monsterTypes.length * 2 + 2 // Regular + boss monsters + player + hat
    let loadedCount = 0

    const updateProgress = () => {
      loadedCount++
      const progress = Math.floor((loadedCount / totalImagesToLoad) * 100)
      setLoadingProgress(progress)
    }

    // Improved image loading function with better error handling
    const loadImage = async (url: string, key: string): Promise<HTMLImageElement | null> => {
      if (!url) {
        console.log(`No URL provided for ${key} image`)
        updateProgress()
        return null
      }

      console.log(`Loading image: ${key} from URL:`, url)
      const img = new Image()
      img.crossOrigin = "anonymous"

      try {
        await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log(`Image loaded successfully: ${key}`)
            updateProgress()
            resolve(null)
          }
          img.onerror = (e) => {
            console.warn(`Failed to load image ${key}:`, url, e)
            updateProgress()
            reject(e)
          }
          img.src = url
        })

        return img
      } catch (error) {
        console.error(`Error loading image ${key}:`, error)
        return null
      }
    }

    // Load player image
    if (playerIconUrl) {
      loadedImagesRef.current.player = await loadImage(playerIconUrl, "player")
    } else {
      updateProgress() // Skip player image if not available
    }

    // Load hat image
    if (playerData?.equipped_hat) {
      const hatUrl = playerData.equipped_hat.startsWith("http")
        ? playerData.equipped_hat
        : await getGameAssetUrl(playerData.equipped_hat)
      loadedImagesRef.current.hat = await loadImage(hatUrl, "hat")
    } else {
      updateProgress() // Skip hat image if not available
    }

    // Load all monster images in parallel for better performance
    const monsterLoadPromises = []

    for (const monsterType of monsterTypes) {
      // Regular monster
      const regularUrl = await getGameAssetUrl(monsterType.icon)
      monsterLoadPromises.push(
        loadImage(regularUrl, monsterType.name).then((img) => {
          if (img) loadedImagesRef.current.monsters[monsterType.name] = img
        }),
      )

      // Boss monster
      const bossUrl = await getGameAssetUrl(monsterType.icon.replace(".png", "_boss.png"))
      monsterLoadPromises.push(
        loadImage(bossUrl, `Boss ${monsterType.name}`).then((img) => {
          if (img) loadedImagesRef.current.monsters[`Boss ${monsterType.name}`] = img
        }),
      )
    }

    // Wait for all monster images to load
    await Promise.allSettled(monsterLoadPromises)

    // Force redraw after loading
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) drawBattleScene(ctx)
    }

    setImagesLoaded(true)
    setGameStatus("paused") // Start in paused state so player can see the first monster
    console.log("All images preloaded")
  }

  useEffect(() => {
    const fetchPlayerData = async () => {
      const user = await getCurrentUser()
      if (user) {
        const data = await getPlayerData(user.id)
        if (data) {
          setPlayerData(data)
          setWave(data.battle_progress.wave)
          setReward({
            xp: data.battle_progress.xp_gained || 0,
            gold: data.battle_progress.gold_gained || 0,
          })

          // Calculate battle stats from player stats
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

          setStats({ attack, defense })

          // Set player icon URL directly from equipped_avatar
          if (data.equipped_avatar) {
            const avatarUrl = data.equipped_avatar.startsWith("http")
              ? data.equipped_avatar
              : await getGameAssetUrl(data.equipped_avatar)
            setPlayerIconUrl(avatarUrl)
          }
        }
      }
    }

    fetchPlayerData()
  }, [])

  // Preload all images when player data is loaded
  useEffect(() => {
    if (playerData && playerIconUrl) {
      preloadAllImages()
    }
  }, [playerData, playerIconUrl])

  useEffect(() => {
    // Save progress when component unmounts
    return () => {
      saveProgress()
    }
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d")
      if (ctx) {
        drawBattleScene(ctx)
      }
    }
  }, [monster, playerHealth, monsterHealth, playerIconUrl, monsterIconUrls, playerData?.equipped_hat, imagesLoaded])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const runBattle = () => {
      if (!monster) {
        const newMonster = wave % 25 === 0 ? createBoss(wave) : createMonster(wave)
        setMonster(newMonster)
        setMonsterHealth(newMonster.health)
        setPlayerHealth(100) // Heal player at the start of each wave
        return
      }

      const result = battle(stats, monster, playerHealth, monsterHealth)
      setPlayerHealth(result.playerHealth)
      setMonsterHealth(result.monsterHealth)

      if (result.playerHealth <= 0) {
        setGameStatus("lost")
        if (interval) clearInterval(interval)
      } else if (result.monsterHealth <= 0) {
        // Reduce gold rewards by 60% but keep XP the same
        const xpReward = wave % 25 === 0 ? wave * 10 : wave * 5
        const goldReward = Math.floor((wave % 25 === 0 ? wave * 5 : wave * 2) * 0.4)

        setReward((prevReward) => ({
          xp: prevReward.xp + xpReward,
          gold: prevReward.gold + goldReward,
        }))
        setWave((prevWave) => prevWave + 1)
        setMonster(null)
        setPlayerHealth(100)
      }
    }

    if (gameStatus === "fighting" && imagesLoaded) {
      interval = setInterval(runBattle, 1000 / speed)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [gameStatus, stats, monster, wave, playerHealth, monsterHealth, speed, imagesLoaded])

  const saveProgress = async () => {
    if (playerData) {
      const updatedPlayerData = {
        ...playerData,
        gold: playerData.gold + reward.gold,
        xp: playerData.xp + reward.xp,
        battle_progress: {
          wave,
          monstersDefeated: playerData.battle_progress.monstersDefeated,
          xp_gained: reward.xp,
          gold_gained: reward.gold,
        },
      }

      await updatePlayerData(playerData.id, updatedPlayerData)
    }
  }

  const handleBattleEnd = async (won: boolean) => {
    if (!playerData) return

    const updatedPlayerData = {
      ...playerData,
      gold: playerData.gold + reward.gold,
      xp: playerData.xp + reward.xp,
      battle_progress: {
        wave: won ? wave + 1 : wave,
        monstersDefeated: playerData.battle_progress.monstersDefeated + (won ? 1 : 0),
        xp_gained: reward.xp,
        gold_gained: reward.gold,
      },
    }

    const success = await updatePlayerData(playerData.id, updatedPlayerData)
    if (success) {
      setPlayerData(updatedPlayerData)
      if (won) {
        setWave(wave + 1)
      }
    }
  }

  const exitBattle = async () => {
    await saveProgress()
    router.push("/")
  }

  const togglePause = () => {
    setGameStatus((prevStatus) => (prevStatus === "fighting" ? "paused" : "fighting"))
  }

  const toggleSpeed = () => {
    setSpeed((prevSpeed) => (prevSpeed === 1 ? 2 : 1))
  }

  const restartGame = () => {
    setPlayerHealth(100)
    setMonster(null)
    setGameStatus("fighting")
  }

  // Improve the handleCustomizationSave function for better image loading and rendering
  const handleCustomizationSave = async (updates: Partial<PlayerData>) => {
    if (playerData) {
      console.log("Received customization updates:", updates)

      // Create updated player data
      const updatedPlayerData = { ...playerData, ...updates }

      // Update local state immediately with the new data
      setPlayerData(updatedPlayerData)

      // Process avatar image updates
      if (updates.equipped_avatar) {
        const avatarUrl = updates.equipped_avatar.startsWith("http")
          ? updates.equipped_avatar
          : await getGameAssetUrl(updates.equipped_avatar)
        setPlayerIconUrl(avatarUrl)

        // Load the new avatar image
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          loadedImagesRef.current.player = img
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d")
            if (ctx) drawBattleScene(ctx)
          }
        }
        img.src = avatarUrl
      }

      // Process hat image updates
      if (updates.equipped_hat !== undefined) {
        // Clear the cached hat image
        loadedImagesRef.current.hat = null

        if (updates.equipped_hat) {
          const hatUrl = updates.equipped_hat.startsWith("http")
            ? updates.equipped_hat
            : await getGameAssetUrl(updates.equipped_hat)
          console.log("New hat URL:", hatUrl)

          // Load the new hat image
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            loadedImagesRef.current.hat = img
            if (canvasRef.current) {
              const ctx = canvasRef.current.getContext("2d")
              if (ctx) drawBattleScene(ctx)
            }
          }
          img.src = hatUrl
        }
      }

      // Save changes to database after updating local state
      const success = await updatePlayerData(playerData.id, updatedPlayerData)
      if (!success) {
        console.error("Failed to save customization changes to database")
      }
    }
  }

  // Update the drawBattleScene function to better handle image loading issues:

  const drawBattleScene = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw background
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    const drawImage = (img: HTMLImageElement | null, x: number, y: number, width: number, height: number) => {
      if (img && img.complete && img.naturalWidth > 0) {
        try {
          ctx.drawImage(img, x, y, width, height)
          return true
        } catch (e) {
          console.error("Error drawing image:", e)
        }
      }
      return false
    }

    // Draw player
    if (!drawImage(loadedImagesRef.current.player, 50, 75, 50, 50)) {
      // Draw placeholder circle if image not loaded
      ctx.fillStyle = "#4ade80"
      ctx.beginPath()
      ctx.arc(75, 100, 25, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw hat
    if (loadedImagesRef.current.hat) {
      ctx.save()
      ctx.translate(50, 55)
      ctx.rotate(-Math.PI / 4)
      drawImage(loadedImagesRef.current.hat, -15, -15, 45, 35)
      ctx.restore()
    }

    // Draw monster
    if (monster) {
      const monsterImg = loadedImagesRef.current.monsters[monster.name]
      if (monsterImg) {
        drawImage(monsterImg, 200, 75, 50, 50)
      } else {
        // Draw placeholder circle if image not loaded
        ctx.fillStyle = "#f43f5e"
        ctx.beginPath()
        ctx.arc(225, 100, 25, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw health bars
    drawHealthBar(ctx, 50, 140, playerHealth, "#4ade80")
    drawHealthBar(ctx, 200, 140, monsterHealth, "#f43f5e")
  }

  function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, health: number, color: string) {
    const width = 50
    const height = 5

    ctx.fillStyle = "#334155"
    ctx.fillRect(x, y, width, height)

    ctx.fillStyle = color
    ctx.fillRect(x, y, width * (health / 100), height)
  }

  // Render loading screen when images are being loaded
  if (gameStatus === "loading") {
    return (
      <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container px-4 py-6 mx-auto max-w-md flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl font-bold mb-8">Loading Battle Arena</h1>
          <Progress value={loadingProgress} max={100} className="w-full h-3 mb-4" />
          <p className="text-sm text-gray-300">{loadingProgress}% - Loading monster images...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container px-4 py-6 mx-auto max-w-md">
        <header className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={exitBattle}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Auto Battler</h1>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">Wave {wave}</span>
          </div>
        </header>

        <Card className="mb-4 border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <canvas ref={canvasRef} width={300} height={200} className="w-full rounded-lg bg-slate-800" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card className="border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-medium">Player</h3>
              <Progress value={playerHealth} max={100} className="h-2 bg-white/10" />
              <span className="text-xs text-white/70">{playerHealth}/100 HP</span>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="mb-2 text-sm font-medium">Monster</h3>
              <Progress value={monsterHealth} max={monster?.health || 100} className="h-2 bg-white/10" />
              <span className="text-xs text-white/70">
                {monsterHealth}/{monster?.health || 100} HP
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <Button
            onClick={() => setShowCustomization(true)}
            variant="outline"
            disabled={!isCustomizationAllowed()}
            className={`px-4 py-2 bg-indigo-500/10 border-indigo-500/50 hover:bg-indigo-500/20 hover:border-indigo-500 transition-all duration-200 ${
              !isCustomizationAllowed() ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
          >
            Customize Character
          </Button>
          <div className="flex items-center gap-2">
            {gameStatus !== "lost" && (
              <>
                <Button
                  onClick={togglePause}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 hover:from-blue-500/30 hover:to-purple-500/30 hover:border-blue-500 transition-all duration-200 hover:scale-105"
                >
                  {gameStatus === "fighting" ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {gameStatus === "fighting" ? "Pause" : "Resume"}
                </Button>
                <Button
                  onClick={toggleSpeed}
                  variant="outline"
                  className={`px-4 py-2 transition-all duration-200 hover:scale-105 ${
                    speed === 2
                      ? "bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 hover:border-yellow-500 text-yellow-300"
                      : "bg-blue-500/10 border-blue-500/50 hover:bg-blue-500/20 hover:border-blue-500"
                  }`}
                >
                  <FastForward className="w-4 h-4 mr-2" />
                  {speed}x
                </Button>
              </>
            )}
            <Button
              onClick={() => setShowShop(true)}
              variant="outline"
              className="px-4 py-2 bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20 hover:border-emerald-500 transition-all duration-200 hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Shop
            </Button>
          </div>
        </div>

        {gameStatus === "lost" && (
          <div className="text-center">
            <p className="mb-2 text-lg font-semibold text-red-400">Defeat</p>
            <p className="mb-4 text-sm">You reached Wave {wave}</p>
            <p className="mb-4 text-sm">
              Total XP: {reward.xp} | Total Gold: {reward.gold}
            </p>
            <Button
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
              onClick={restartGame}
            >
              Continue from Wave {wave}
            </Button>
          </div>
        )}
      </div>

      {showCustomization && playerData && isCustomizationAllowed() && (
        <CharacterCustomization
          playerData={playerData}
          onClose={() => setShowCustomization(false)}
          onSave={handleCustomizationSave}
        />
      )}

      {showShop && (
        <Shop
          gold={playerData?.gold || 0}
          onClose={() => setShowShop(false)}
          onPurchase={(item, cost) => {
            if (playerData) {
              const updatedPlayerData = {
                ...playerData,
                gold: playerData.gold - cost,
                inventory: {
                  ...playerData.inventory,
                  [item.type === "avatar" ? "avatars" : "hats"]: [
                    ...playerData.inventory[item.type === "avatar" ? "avatars" : "hats"],
                    item.image,
                  ],
                },
              }
              updatePlayerData(playerData.id, updatedPlayerData)
              setPlayerData(updatedPlayerData)
            }
          }}
        />
      )}
    </main>
  )
}

