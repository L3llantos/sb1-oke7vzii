import { supabase } from "./supabase"

interface SpecialItems {
  avatars: string[]
  hats: string[]
  borders: string[]
}

export async function getSpecialItems(playerId: string): Promise<SpecialItems> {
  try {
    console.log("Fetching special items for player:", playerId)

    const { data: playerItems, error: playerItemsError } = await supabase
      .from("player_special_items")
      .select(`
        item_id,
        special_items (id, name, image, item_type)
      `)
      .eq("user_id", playerId)

    if (playerItemsError) {
      console.error("Error fetching player special items:", playerItemsError)
      return { avatars: [], hats: [], borders: [] }
    }

    if (!playerItems || playerItems.length === 0) {
      console.log("No special items found for player:", playerId)
      return { avatars: [], hats: [], borders: [] }
    }

    console.log("Found special items:", playerItems)

    const specialItems: SpecialItems = {
      avatars: [],
      hats: [],
      borders: [],
    }

    playerItems.forEach((item) => {
      if (!item.special_items) {
        console.warn("Missing special_items data for item:", item)
        return
      }

      const itemType = item.special_items.item_type
      const itemImage = item.special_items.image

      if (!itemImage) {
        console.warn("Missing image for special item:", item.special_items)
        return
      }

      console.log(`Processing special item: ${item.special_items.name}, type: ${itemType}, image: ${itemImage}`)

      if (itemType === "avatar") {
        specialItems.avatars.push(itemImage)
      } else if (itemType === "hat") {
        specialItems.hats.push(itemImage)
      } else if (itemType === "border") {
        specialItems.borders.push(itemImage)
      } else {
        console.warn("Unknown item type:", itemType)
      }
    })

    console.log("Processed special items:", specialItems)
    return specialItems
  } catch (error) {
    console.error("Unexpected error in getSpecialItems:", error)
    return { avatars: [], hats: [], borders: [] }
  }
}

