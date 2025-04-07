// Define the border unlocks with their level requirements
export const BORDER_UNLOCKS = [
  { id: 1, name: "Bronze Frame", level: 5, image: "shop_border_bronze_frame.png" },
  { id: 2, name: "Silver Frame", level: 10, image: "shop_border_silver_frame.png" },
  { id: 3, name: "Gold Frame", level: 20, image: "shop_border_gold_frame.png" },
  { id: 4, name: "Diamond Frame", level: 30, image: "shop_border_diamond_frame.png" },
]

// Get all borders that should be unlocked for a given player level
export function getUnlockedBorders(playerLevel: number): typeof BORDER_UNLOCKS {
  // Add console.log for debugging
  console.log("Checking borders for player level:", playerLevel)
  const unlockedBorders = BORDER_UNLOCKS.filter((border) => playerLevel >= border.level)
  console.log("Unlocked borders:", unlockedBorders)
  return unlockedBorders
}

// Check if a specific border is unlocked
export function isBorderUnlocked(borderName: string, playerLevel: number): boolean {
  const border = BORDER_UNLOCKS.find((b) => b.name === borderName)
  if (!border) return false
  return playerLevel >= border.level
}

// Get the next border unlock information
export function getNextBorderUnlock(playerLevel: number): (typeof BORDER_UNLOCKS)[0] | null {
  const nextBorder = BORDER_UNLOCKS.find((border) => playerLevel < border.level)
  return nextBorder || null
}

