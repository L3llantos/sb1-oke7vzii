"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getGameAssetUrl } from "@/lib/supabase"
import { updatePlayerData } from "@/lib/player-db"
import { getUnlockedBorders } from "@/lib/border-utils"
import { getSpecialItems } from "@/lib/special-items"

// Update the props type to include playerLevel
type CharacterCustomizationPropsWithPlayerData = {
  playerData: {
    id: string
    equipped_avatar: string | null
    equipped_hat: string | null
    equipped_border: string | null
    inventory: {
      avatars: string[]
      hats: string[]
    }
    level: number
  }
  onClose: () => void
  onSave: (updates: any) => void
  showTitle?: boolean
}

type CharacterCustomizationPropsWithIndividualProps = {
  playerId: string
  initialEquippedAvatar: string | null
  initialEquippedHat: string | null
  initialEquippedBorder: string | null
  initialInventory: {
    avatars: string[]
    hats: string[]
  }
  playerLevel: number // Add this line
  onUpdate: () => void
  showTitle?: boolean
}

type CharacterCustomizationProps =
  | CharacterCustomizationPropsWithPlayerData
  | CharacterCustomizationPropsWithIndividualProps

export default function CharacterCustomization(props: CharacterCustomizationProps) {
  const isUsingPlayerData = "playerData" in props

  // Get the player level from either prop pattern
  const [playerLevel] = useState(isUsingPlayerData ? props.playerData.level : props.playerLevel)

  // Initialize state based on prop pattern
  const [playerId] = useState(isUsingPlayerData ? props.playerData.id : props.playerId)
  const [selectedAvatar, setSelectedAvatar] = useState(
    isUsingPlayerData ? props.playerData.equipped_avatar || "" : props.initialEquippedAvatar || "",
  )
  const [selectedHat, setSelectedHat] = useState(
    isUsingPlayerData ? props.playerData.equipped_hat : props.initialEquippedHat,
  )
  const [selectedBorder, setSelectedBorder] = useState(
    isUsingPlayerData ? props.playerData.equipped_border : props.initialEquippedBorder,
  )

  const [inventory] = useState(isUsingPlayerData ? props.playerData.inventory : props.initialInventory)
  const [avatars, setAvatars] = useState<string[]>([])
  const [hats, setHats] = useState<string[]>([])
  const [borders, setBorders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(isUsingPlayerData)

  // Add proper image loading with error handling and lazy loading

  // Update the loadAssets function to include better error handling and loading states
  const loadAssets = async () => {
    try {
      setIsLoading(true)

      // Get special items first
      const specialItems = await getSpecialItems(playerId)
      console.log("Loaded special items:", specialItems)

      // Process regular avatars with better error handling
      const defaultAvatars = await Promise.all([
        getGameAssetUrl("Player.png").catch(() => {
          console.warn("Failed to load default Player.png, using placeholder")
          return "/placeholder.svg"
        }),
        getGameAssetUrl("Female_player.png").catch(() => {
          console.warn("Failed to load Female_player.png, using placeholder")
          return "/placeholder.svg"
        }),
      ])

      // Process purchased avatars from inventory with better error handling
      const purchasedAvatars = await Promise.all(
        inventory.avatars
          .filter((url) => url !== "default")
          .map(async (avatar) => {
            try {
              return avatar.startsWith("http") ? avatar : await getGameAssetUrl(avatar)
            } catch (error) {
              console.error(`Failed to load avatar image: ${avatar}`, error)
              return "/placeholder.svg"
            }
          }),
      )

      // Process special avatars
      const specialAvatars = await Promise.all(
        specialItems.avatars.map(async (avatar) => {
          try {
            return avatar.startsWith("http") ? avatar : await getGameAssetUrl(avatar)
          } catch (error) {
            console.error(`Failed to load special avatar image: ${avatar}`, error)
            return "/placeholder.svg"
          }
        }),
      )

      // Combine all avatars and remove duplicates
      const allAvatars = [...new Set([...defaultAvatars, ...purchasedAvatars, ...specialAvatars])]
      setAvatars(allAvatars)

      // Process regular hats from inventory
      const inventoryHats = await Promise.all(
        inventory.hats.map(async (hat) => {
          try {
            return hat.startsWith("http") ? hat : await getGameAssetUrl(hat)
          } catch (error) {
            console.error(`Failed to load hat image: ${hat}`, error)
            return "/placeholder.svg"
          }
        }),
      )

      // Process special hats
      const specialHats = await Promise.all(
        specialItems.hats.map(async (hat) => {
          try {
            return hat.startsWith("http") ? hat : await getGameAssetUrl(hat)
          } catch (error) {
            console.error(`Failed to load special hat image: ${hat}`, error)
            return "/placeholder.svg"
          }
        }),
      )

      // Combine all hats and remove duplicates
      const allHats = [...new Set([...inventoryHats, ...specialHats])]
      setHats(allHats)

      // Process regular borders - now using the correct player level
      const unlockedBorders = getUnlockedBorders(playerLevel)
      console.log("Unlocked borders for level", playerLevel, ":", unlockedBorders)

      const regularBorders = await Promise.all(
        unlockedBorders.map(async (border) => {
          try {
            return border.image.startsWith("http") ? border.image : await getGameAssetUrl(border.image)
          } catch (error) {
            console.error(`Failed to load border image: ${border.image}`, error)
            return "/placeholder.svg"
          }
        }),
      )

      // Process special borders
      const specialBorders = await Promise.all(
        specialItems.borders.map(async (border) => {
          try {
            return border.startsWith("http") ? border : await getGameAssetUrl(border)
          } catch (error) {
            console.error(`Failed to load special border image: ${border}`, error)
            return "/placeholder.svg"
          }
        }),
      )

      // Combine all borders and remove duplicates
      const allBorders = [...new Set([...regularBorders, ...specialBorders])]
      setBorders(allBorders)

      setError(null)
    } catch (err) {
      console.error("Error in loadAssets:", err)
      setError("Failed to load items")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAssets()
  }, [playerId, inventory, playerLevel]) // Add playerLevel to the dependency array

  const handleSave = async () => {
    console.log("Saving character with:", {
      avatar: selectedAvatar,
      hat: selectedHat,
      border: selectedBorder,
    })

    const updates = {
      equipped_avatar: selectedAvatar,
      equipped_hat: selectedHat,
      equipped_border: selectedBorder,
    }

    try {
      // Save the updates to the database
      await updatePlayerData(playerId, updates)

      // Call the appropriate callback based on prop pattern
      if (isUsingPlayerData) {
        props.onSave(updates)
      } else {
        props.onUpdate()
      }

      // Close the modal if we're in modal mode
      if (showModal) {
        setShowModal(false)
        if (isUsingPlayerData) {
          props.onClose()
        }
      }
    } catch (error) {
      console.error("Error saving character customization:", error)
      setError("Failed to save changes")
    }
  }

  const handleClose = () => {
    if (isUsingPlayerData) {
      props.onClose()
    }
    setShowModal(false)
  }

  // Determine if we should show the title
  const shouldShowTitle = props.showTitle !== undefined ? props.showTitle : true

  // Render the component content
  const renderContent = () => (
    <>
      {shouldShowTitle && <h2 className="text-2xl font-bold mb-4">Customize Character</h2>}
      <Tabs defaultValue="avatars">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="avatars">Avatars</TabsTrigger>
          <TabsTrigger value="hats">Hats</TabsTrigger>
          <TabsTrigger value="borders">Borders</TabsTrigger>
        </TabsList>
        <TabsContent value="avatars">
          {isLoading && <p>Loading items...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {avatars.map((avatar, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto aspect-square p-2 ${
                  selectedAvatar === avatar ? "border-yellow-500" : "border-white/10"
                }`}
                onClick={() => setSelectedAvatar(avatar)}
              >
                <img
                  src={avatar || "/placeholder.svg"}
                  alt={`Avatar ${index + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error(`Failed to load avatar image: ${avatar}`)
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                  loading="lazy"
                />
              </Button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="hats">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Button
              variant="outline"
              className={`h-auto aspect-square p-2 ${selectedHat === null ? "border-yellow-500" : "border-white/10"}`}
              onClick={() => setSelectedHat(null)}
            >
              No Hat
            </Button>
            {hats.map((hat, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto aspect-square p-2 ${selectedHat === hat ? "border-yellow-500" : "border-white/10"}`}
                onClick={() => setSelectedHat(hat)}
              >
                <img
                  src={hat || "/placeholder.svg"}
                  alt={`Hat ${index + 1}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    console.error(`Failed to load hat image: ${hat}`)
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                  loading="lazy"
                />
              </Button>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="borders">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Button
              variant="outline"
              className={`h-auto aspect-square p-2 ${
                selectedBorder === null ? "border-yellow-500" : "border-white/10"
              }`}
              onClick={() => setSelectedBorder(null)}
            >
              No Border
            </Button>
            {borders.map((borderUrl, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-auto aspect-square p-2 ${
                  selectedBorder === borderUrl ? "border-yellow-500" : "border-white/10"
                }`}
                onClick={() => setSelectedBorder(borderUrl)}
              >
                <div className="relative w-full h-full">
                  <div className="w-full h-full rounded-full bg-gray-700"></div>
                  <img
                    src={borderUrl || "/placeholder.svg"}
                    alt={`Border ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-contain"
                    onError={(e) => {
                      console.error(`Failed to load border image: ${borderUrl}`)
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                    loading="lazy"
                  />
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex justify-between mt-4">
        {isUsingPlayerData && (
          <Button onClick={handleClose} variant="outline">
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} className={isUsingPlayerData ? "" : "w-full"}>
          Save Changes
        </Button>
      </div>
    </>
  )

  // If we're in modal mode (from auto-battler), render the modal
  if (showModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md border-0 bg-slate-800">
          <CardContent className="p-6">{renderContent()}</CardContent>
        </Card>
      </div>
    )
  }

  // Otherwise, render the content directly (for settings page)
  return renderContent()
}

