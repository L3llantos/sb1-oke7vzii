"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Users, Swords, Dumbbell, Brain, Zap, Activity, Timer, Heart } from "lucide-react"
import { getPlayerData, updatePlayerData, type PlayerData, getPlayerDataById } from "@/lib/player-db"
import { getCurrentUser, getGameAssetUrl } from "@/lib/supabase"
import { getFriends, type Friend } from "@/lib/friend-functions"
import { pvpBattle } from "@/lib/pvp-battle"

interface FriendWithStats extends Friend {
  stats?: PlayerData["stats"]
}

interface BattleAssets {
  playerAvatar?: HTMLImageElement
  playerHat?: HTMLImageElement
  playerBorder?: HTMLImageElement
  friendAvatar?: HTMLImageElement
  friendHat?: HTMLImageElement
  friendBorder?: HTMLImageElement
}

const getStatIcon = (stat: string) => {
  switch (stat) {
    case "strength":
      return <Dumbbell className="w-4 h-4" />
    case "intelligence":
      return <Brain className="w-4 h-4" />
    case "speed":
      return <Zap className="w-4 h-4" />
    case "stamina":
      return <Activity className="w-4 h-4" />
    case "focus":
      return <Timer className="w-4 h-4" />
    case "vitality":
      return <Heart className="w-4 h-4" />
    default:
      return null
  }
}

const getStyledStat = (stat: string, value: number) => {
  const icon = getStatIcon(stat)
  let color = "text-gray-400"

  // Highlight speed with a special color
  if (stat === "speed") {
    color = "text-yellow-400"
  }

  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className={`text-xs ${color}`}>
        {stat.charAt(0).toUpperCase() + stat.slice(1)}: {value}
      </span>
    </div>
  )
}

// Helper function to check if a string is a valid URL
const isValidUrl = (urlString: string): boolean => {
  try {
    return Boolean(new URL(urlString))
  } catch (e) {
    return false
  }
}

export default function PvpArenaPage() {
  const router = useRouter()
  const [playerData, setPlayerData] = useState<PlayerData | null>(null)
  const [friends, setFriends] = useState<FriendWithStats[]>([])
  const [selectedFriend, setSelectedFriend] = useState<FriendWithStats | null>(null)
  const [battleResult, setBattleResult] = useState<string | null>(null)
  const [playerHealth, setPlayerHealth] = useState(100)
  const [friendHealth, setFriendHealth] = useState(100)
  const [error, setError] = useState<string | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [isBattling, setIsBattling] = useState(false)
  const [showStats, setShowStats] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const battleAssetsRef = useRef<BattleAssets>({})
  const animationFrameRef = useRef<number>()
  const [defaultAvatarUrl, setDefaultAvatarUrl] = useState<string | null>(null)

  // Add a new ref to store the loaded battle assets
  const battleImagesRef = useRef<{
    playerAvatar: HTMLImageElement | null
    playerHat: HTMLImageElement | null
    playerBorder: HTMLImageElement | null
    friendAvatar: HTMLImageElement | null
    friendHat: HTMLImageElement | null
    friendBorder: HTMLImageElement | null
  }>({
    playerAvatar: null,
    playerHat: null,
    playerBorder: null,
    friendAvatar: null,
    friendHat: null,
    friendBorder: null,
  })

  // Load default avatar once on component mount
  useEffect(() => {
    const loadDefaultAvatar = async () => {
      try {
        const url = await getGameAssetUrl("Player.png")
        setDefaultAvatarUrl(url)
      } catch (e) {
        console.warn("Could not load default avatar:", e)
        setDefaultAvatarUrl("/placeholder.svg?height=50&width=50")
      }
    }

    loadDefaultAvatar()
  }, [])

  // Load and cache images
  const loadImage = async (src: string | null | undefined): Promise<HTMLImageElement | null> => {
    if (!src) return null

    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => resolve(img)

      img.onerror = (e) => {
        console.error(`Failed to load image from ${src}`, e)
        resolve(null) // Resolve with null instead of rejecting
      }

      img.src = src
    })
  }

  // Get the correct URL for an asset
  const getAssetUrl = async (assetPath: string | null | undefined): Promise<string | null> => {
    if (!assetPath) return null

    // If it's already a valid URL, return it directly
    if (isValidUrl(assetPath)) {
      return assetPath
    }

    // Otherwise, get the URL from Supabase
    try {
      return await getGameAssetUrl(assetPath)
    } catch (e) {
      console.warn(`Failed to get URL for asset: ${assetPath}`, e)
      return null
    }
  }

  // Also update the loadBattleAssets function in PVP arena to use better image loading:
  const loadBattleAssets = async () => {
    if (!playerData || !selectedFriend) return

    try {
      console.log("Loading battle assets for player:", playerData.username)
      console.log("Player avatar:", playerData.equipped_avatar)
      console.log("Player hat:", playerData.equipped_hat)
      console.log("Player border:", playerData.equipped_border)

      // Create a default avatar as fallback
      let defaultAvatar: HTMLImageElement | null = null
      if (defaultAvatarUrl) {
        defaultAvatar = await loadImage(defaultAvatarUrl)
      }

      // Function to load a specific asset with proper error handling
      const loadAsset = async (
        url: string | null | undefined,
        key: "playerAvatar" | "playerHat" | "playerBorder" | "friendAvatar" | "friendHat" | "friendBorder",
        fallbackImg: HTMLImageElement | null = null,
      ) => {
        if (!url) {
          battleImagesRef.current[key] = fallbackImg
          return
        }

        try {
          // Get the correct URL if needed
          const assetUrl = url.startsWith("http") ? url : await getAssetUrl(url)
          if (!assetUrl) {
            battleImagesRef.current[key] = fallbackImg
            return
          }

          const img = await loadImage(assetUrl)
          battleImagesRef.current[key] = img || fallbackImg
        } catch (e) {
          console.warn(`Error loading ${key}:`, e)
          battleImagesRef.current[key] = fallbackImg
        }
      }

      // Load player assets
      await loadAsset(playerData.equipped_avatar, "playerAvatar", defaultAvatar)
      await loadAsset(playerData.equipped_hat, "playerHat")
      await loadAsset(playerData.equipped_border, "playerBorder")

      // Load friend assets
      try {
        const friendData = await getPlayerDataById(selectedFriend.id)
        if (friendData) {
          await loadAsset(friendData.equipped_avatar, "friendAvatar", defaultAvatar)
          await loadAsset(friendData.equipped_hat, "friendHat")
          await loadAsset(friendData.equipped_border, "friendBorder")
        }
      } catch (e) {
        console.warn("Error loading friend data:", e)
        battleImagesRef.current.friendAvatar = defaultAvatar
      }

      // If we still don't have avatars, use placeholder
      if (!battleImagesRef.current.playerAvatar || !battleImagesRef.current.friendAvatar) {
        console.warn("Using placeholder for missing avatars")
        const placeholderImg = new Image()
        placeholderImg.src = "/placeholder.svg?height=50&width=50"

        if (!battleImagesRef.current.playerAvatar) {
          battleImagesRef.current.playerAvatar = placeholderImg
        }

        if (!battleImagesRef.current.friendAvatar) {
          // Create a new image to avoid sharing the same instance
          const friendPlaceholder = new Image()
          friendPlaceholder.src = "/placeholder.svg?height=50&width=50"
          battleImagesRef.current.friendAvatar = friendPlaceholder
        }
      }

      // Force a redraw after loading assets
      if (canvasRef.current) {
        drawBattleScene()
      }
    } catch (error) {
      console.error("Error in loadBattleAssets:", error)
      // Create placeholder images as a last resort
      const placeholderImg = new Image()
      placeholderImg.src = "/placeholder.svg?height=50&width=50"

      battleImagesRef.current.playerAvatar = placeholderImg

      const friendPlaceholder = new Image()
      friendPlaceholder.src = "/placeholder.svg?height=50&width=50"
      battleImagesRef.current.friendAvatar = friendPlaceholder
    }
  }

  // Update the drawBattleScene function to use the cached images
  const drawBattleScene = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = "#1e293b"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const images = battleImagesRef.current

    // Draw player
    if (images.playerBorder) {
      try {
        ctx.drawImage(images.playerBorder, 40, 65, 70, 70)
      } catch (e) {
        console.warn("Error drawing player border:", e)
      }
    }

    if (images.playerAvatar) {
      try {
        ctx.drawImage(images.playerAvatar, 50, 75, 50, 50)
      } catch (e) {
        console.warn("Error drawing player avatar:", e)
        // Draw a fallback circle if drawing fails
        ctx.fillStyle = "#4ade80"
        ctx.beginPath()
        ctx.arc(75, 100, 25, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      // Draw a fallback circle if no avatar
      ctx.fillStyle = "#4ade80"
      ctx.beginPath()
      ctx.arc(75, 100, 25, 0, Math.PI * 2)
      ctx.fill()
    }

    if (images.playerHat) {
      try {
        ctx.save()
        // Position the hat above and slightly to the left of the avatar
        ctx.translate(50, 55)
        // Rotate -45 degrees
        ctx.rotate(-Math.PI / 4)
        // Draw the hat with larger dimensions
        ctx.drawImage(images.playerHat, -15, -15, 45, 35)
        ctx.restore()
      } catch (e) {
        console.warn("Error drawing player hat:", e)
      }
    }

    // Draw friend
    if (images.friendBorder) {
      try {
        ctx.drawImage(images.friendBorder, 190, 65, 70, 70)
      } catch (e) {
        console.warn("Error drawing friend border:", e)
      }
    }

    if (images.friendAvatar) {
      try {
        ctx.drawImage(images.friendAvatar, 200, 75, 50, 50)
      } catch (e) {
        console.warn("Error drawing friend avatar:", e)
        // Draw a fallback circle if drawing fails
        ctx.fillStyle = "#f43f5e"
        ctx.beginPath()
        ctx.arc(225, 100, 25, 0, Math.PI * 2)
        ctx.fill()
      }
    } else {
      // Draw a fallback circle if no avatar
      ctx.fillStyle = "#f43f5e"
      ctx.beginPath()
      ctx.arc(225, 100, 25, 0, Math.PI * 2)
      ctx.fill()
    }

    if (images.friendHat) {
      try {
        ctx.save()
        // Position the hat above and slightly to the left of the avatar
        ctx.translate(200, 55)
        // Rotate -45 degrees
        ctx.rotate(-Math.PI / 4)
        // Draw the hat with larger dimensions
        ctx.drawImage(images.friendHat, -15, -15, 45, 35)
        ctx.restore()
      } catch (e) {
        console.warn("Error drawing friend hat:", e)
      }
    }

    // Draw health bars
    drawHealthBar(ctx, 50, 140, playerHealth, "#4ade80")
    drawHealthBar(ctx, 200, 140, friendHealth, "#f43f5e")

    // Continue animation
    animationFrameRef.current = requestAnimationFrame(drawBattleScene)
  }

  // Start animation when component mounts or battle starts
  useEffect(() => {
    if (selectedFriend) {
      loadBattleAssets().then(() => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        drawBattleScene()
      })
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [selectedFriend, playerData])

  // Update battle scene when health changes
  useEffect(() => {
    if (canvasRef.current && selectedFriend) {
      drawBattleScene()
    }
  }, [playerHealth, friendHealth])

  function drawHealthBar(ctx: CanvasRenderingContext2D, x: number, y: number, health: number, color: string) {
    const width = 50
    const height = 5

    // Draw background (empty health bar)
    ctx.fillStyle = "#334155"
    ctx.fillRect(x, y, width, height)

    // Ensure health percentage is between 0 and 100
    const healthPercentage = Math.max(0, Math.min(100, health)) / 100

    // Draw filled portion of health bar
    ctx.fillStyle = color
    ctx.fillRect(x, y, width * healthPercentage, height)
  }

  // Also update the selectFriend function to reset the images when a new friend is selected
  const selectFriend = async (friend: FriendWithStats) => {
    setSelectedFriend(friend)
    setShowStats(null)
    setBattleLog([]) // Clear any previous battle logs
    setBattleResult(null) // Reset battle result to allow starting a new battle
    setPlayerHealth(100) // Reset player health
    setFriendHealth(100) // Reset friend health
    setIsBattling(false) // Ensure battle state is not active

    // Reset cached images for the new battle
    battleImagesRef.current = {
      playerAvatar: null,
      playerHat: null,
      playerBorder: null,
      friendAvatar: null,
      friendHat: null,
      friendBorder: null,
    }

    // Add initial speed comparison to battle log
    if (playerData && friend.stats) {
      const playerSpeed = playerData.stats.speed
      const friendSpeed = friend.stats.speed

      if (playerSpeed >= friendSpeed) {
        setBattleLog([
          `${playerData.username} (${playerSpeed} speed) will attack first against ${friend.username} (${friendSpeed} speed).`,
        ])
      } else {
        setBattleLog([
          `${friend.username} (${friendSpeed} speed) will attack first against ${playerData.username} (${playerSpeed} speed).`,
        ])
      }
    }
  }

  const startBattle = async () => {
    if (!playerData || !selectedFriend) return

    setIsBattling(true)
    setBattleResult(null)
    setBattleLog([])
    // Ensure initial health values are valid
    setPlayerHealth(Math.max(0, Math.min(100, 100)))
    setFriendHealth(Math.max(0, Math.min(100, 100)))

    try {
      const result = await pvpBattle(playerData, selectedFriend, (state) => {
        // Constrain health values during battle updates
        setPlayerHealth(Math.max(0, Math.min(100, state.playerHealth)))
        setFriendHealth(Math.max(0, Math.min(100, state.friendHealth)))
        setBattleLog(state.log)
      })

      if (result.winner === null) {
        setBattleResult("It's a draw!")
      } else if (result.winner === playerData.id) {
        setBattleResult("You won!")
        const updatedPlayerData = {
          ...playerData,
          xp: playerData.xp + result.xpGained,
        }
        await updatePlayerData(playerData.id, updatedPlayerData)
        setPlayerData(updatedPlayerData)
      } else {
        setBattleResult("You lost!")
      }
    } catch (error) {
      console.error("Error during battle:", error)
      setError("An error occurred during the battle. Please try again.")
    } finally {
      setIsBattling(false)
      // Ensure final health values are valid
      setPlayerHealth((prev) => Math.max(0, Math.min(100, prev)))
      setFriendHealth((prev) => Math.max(0, Math.min(100, prev)))
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const user = await getCurrentUser()
      if (user) {
        const data = await getPlayerData(user.id)
        if (data) {
          setPlayerData(data)
          try {
            const friendsList = await getFriends(user.id)
            const friendsWithStats = await Promise.all(
              friendsList.map(async (friend) => {
                const friendData = await getPlayerDataById(friend.id)
                return { ...friend, stats: friendData?.stats }
              }),
            )
            setFriends(friendsWithStats)
          } catch (error) {
            console.error("Error fetching friends:", error)
            setError("Failed to load friends. Please try again later.")
          }
        }
      }
    }

    fetchData()
  }, [])

  if (!playerData) {
    return <div>Loading...</div>
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container px-4 py-6 mx-auto max-w-md">
        <header className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">PvP Arena</h1>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Friends: {friends.length}</span>
          </div>
        </header>

        {error && (
          <Card className="mb-6 border-0 bg-red-500/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6 border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Select a Friend to Battle</h2>
            <div className="space-y-2">
              {friends.map((friend) => (
                <div key={friend.id}>
                  <Button
                    variant="outline"
                    className={`w-full justify-between ${selectedFriend?.id === friend.id ? "bg-blue-500/20" : ""}`}
                    onClick={() => {
                      if (showStats === friend.id) {
                        setShowStats(null)
                      } else {
                        setShowStats(friend.id)
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        {friend.profile_picture_url ? (
                          <img
                            src={friend.profile_picture_url || "/placeholder.svg"}
                            alt={friend.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <span>{friend.username}</span>
                    </div>
                    <span className="text-xs text-blue-400">View Stats</span>
                  </Button>

                  {showStats === friend.id && friend.stats && (
                    <Card className="mt-2 border-0 bg-white/5">
                      <CardContent className="p-4 grid gap-2">
                        {Object.entries(friend.stats).map(([stat, value]) => (
                          <div key={stat} className="flex items-center gap-2">
                            {getStatIcon(stat)}
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-xs capitalize">{stat}</span>
                                <span className="text-xs">{value}</span>
                              </div>
                              <Progress value={value} className="h-1" />
                            </div>
                          </div>
                        ))}
                        <Button className="w-full mt-2" onClick={() => selectFriend(friend)}>
                          Select for Battle
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedFriend && (
          <Card className="mb-6 border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Battle</h2>

              <canvas ref={canvasRef} width={300} height={200} className="w-full rounded-lg bg-slate-800 mb-4" />

              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="font-medium">{playerData.username}</p>
                  <div className="flex flex-col gap-1 text-xs mb-1">
                    {getStyledStat("speed", playerData.stats.speed)}
                  </div>
                  <Progress value={playerHealth} className="w-32" />
                </div>
                <Swords className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="font-medium">{selectedFriend.username}</p>
                  <div className="flex flex-col gap-1 text-xs mb-1">
                    {selectedFriend.stats && getStyledStat("speed", selectedFriend.stats.speed)}
                  </div>
                  <Progress value={friendHealth} className="w-32" />
                </div>
              </div>
              <Button className="w-full mb-4" onClick={startBattle} disabled={isBattling || !!battleResult}>
                {isBattling ? "Battle in progress..." : battleResult ? "Battle Ended" : "Start Battle"}
              </Button>
              {battleResult && <p className="text-center font-bold text-lg mb-4">{battleResult}</p>}
              <div className="h-40 overflow-y-auto bg-black/20 p-2 rounded">
                {battleLog.map((log, index) => (
                  <p key={index} className="text-sm">
                    {log}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

