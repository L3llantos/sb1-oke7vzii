"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"
import { getGameAssetUrl } from "@/lib/supabase"

type ShopItem = {
  id: number
  name: string
  image: string
  cost: number
  type: "avatar" | "hat"
}

type ShopProps = {
  gold: number
  onClose: () => void
  onPurchase: (item: ShopItem, cost: number) => void
  inventory?: any
}

const shopItems: Omit<ShopItem, "image">[] = [
  { id: 1, name: "Warrior", cost: 2500, type: "avatar" },
  { id: 2, name: "Mage", cost: 5000, type: "avatar" },
  { id: 3, name: "Rogue", cost: 7500, type: "avatar" },
  { id: 4, name: "Paladin", cost: 10000, type: "avatar" },
  { id: 5, name: "Wizard Hat", cost: 1250, type: "hat" },
  { id: 6, name: "Crown", cost: 2500, type: "hat" },
  { id: 7, name: "Helmet", cost: 1800, type: "hat" },
  { id: 8, name: "Cap", cost: 600, type: "hat" },
]

export default function Shop({ gold, onClose, onPurchase, inventory }: ShopProps) {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [items, setItems] = useState<ShopItem[]>([])
  const [activeTab, setActiveTab] = useState("avatars")

  useEffect(() => {
    const loadImages = async () => {
      try {
        const loadedItems = await Promise.all(
          shopItems.map(async (item) => {
            let imageName = ""

            if (item.type === "avatar") {
              imageName = `shop_avatar_${item.name.toLowerCase().replace(/\s+/g, "_")}.png`
            } else if (item.type === "hat") {
              imageName = `shop_hat_${item.name.toLowerCase().replace(/\s+/g, "_")}.png`
            } else if (item.type === "border") {
              imageName = `shop_border_${item.name.toLowerCase().replace(/\s+/g, "_")}.png`
            }

            try {
              const imageUrl = await getGameAssetUrl(imageName)
              return { ...item, image: imageUrl }
            } catch (error) {
              console.warn(`Failed to load image for ${item.name}, using placeholder`)
              return { ...item, image: "/placeholder.svg" }
            }
          }),
        )
        setItems(loadedItems)
      } catch (error) {
        console.error("Error loading shop items:", error)
        // Set empty items array if there's an error
        setItems([])
      }
    }

    loadImages()
  }, [])

  const handlePurchase = () => {
    if (selectedItem && gold >= selectedItem.cost) {
      onPurchase(selectedItem, selectedItem.cost)
      setSelectedItem(null)
    }
  }

  // Check if an item is already in the inventory
  const isItemOwned = (item: ShopItem) => {
    if (!inventory) return false

    if (item.type === "avatar") {
      return inventory.avatars.includes(item.image)
    } else if (item.type === "hat") {
      return inventory.hats.includes(item.image)
    } else if (item.type === "border") {
      return inventory.borders && inventory.borders.includes(item.image)
    }

    return false
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <Card className="w-full max-w-md border-0 bg-slate-800">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Shop</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="mb-4">Your Gold: {gold}</p>
          <Tabs defaultValue="avatars" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avatars">Avatars</TabsTrigger>
              <TabsTrigger value="hats">Hats</TabsTrigger>
            </TabsList>
            <TabsContent value="avatars">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {items
                  .filter((item) => item.type === "avatar")
                  .map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className={`h-auto p-4 ${selectedItem?.id === item.id ? "border-yellow-500" : "border-white/10"} ${
                        isItemOwned(item) ? "opacity-50" : ""
                      }`}
                      onClick={() => setSelectedItem(isItemOwned(item) ? null : item)}
                      disabled={isItemOwned(item)}
                    >
                      <div className="flex flex-col items-center">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 rounded-full mb-2"
                        />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-xs text-yellow-500">
                          {isItemOwned(item) ? "Owned" : `${item.cost} Gold`}
                        </span>
                      </div>
                    </Button>
                  ))}
              </div>
            </TabsContent>
            <TabsContent value="hats">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {items
                  .filter((item) => item.type === "hat")
                  .map((item) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className={`h-auto p-4 ${selectedItem?.id === item.id ? "border-yellow-500" : "border-white/10"} ${
                        isItemOwned(item) ? "opacity-50" : ""
                      }`}
                      onClick={() => setSelectedItem(isItemOwned(item) ? null : item)}
                      disabled={isItemOwned(item)}
                    >
                      <div className="flex flex-col items-center">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-16 h-16 object-contain mb-2"
                        />
                        <span className="text-sm">{item.name}</span>
                        <span className="text-xs text-yellow-500">
                          {isItemOwned(item) ? "Owned" : `${item.cost} Gold`}
                        </span>
                      </div>
                    </Button>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
          <Button
            className="w-full"
            disabled={!selectedItem || gold < (selectedItem?.cost ?? 0) || isItemOwned(selectedItem as ShopItem)}
            onClick={handlePurchase}
          >
            {selectedItem ? `Purchase ${selectedItem.name}` : "Select an item"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

