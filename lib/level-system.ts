// Central level calculation system for consistent level calculations across the app

// Define the level thresholds
// This is the amount of XP needed to reach each level
export const LEVEL_THRESHOLDS = [
  0, // Level 1 (starting level)
  100, // Level 2
  300, // Level 3
  600, // Level 4
  1000, // Level 5
  1500, // Level 6
  2100, // Level 7
  2800, // Level 8
  3600, // Level 9
  4500, // Level 10
  5500, // Level 11
  6600, // Level 12
  7800, // Level 13
  9100, // Level 14
  10500, // Level 15
  12000, // Level 16
  13600, // Level 17
  15300, // Level 18
  17100, // Level 19
  19000, // Level 20
  21000, // Level 21
  23100, // Level 22
  25300, // Level 23
  27600, // Level 24
  30000, // Level 25
  32500, // Level 26
  35100, // Level 27
  37800, // Level 28
  40600, // Level 29
  43500, // Level 30
  46500, // Level 31
  49600, // Level 32
  52800, // Level 33
  56100, // Level 34
  59500, // Level 35
  63000, // Level 36
  66600, // Level 37
  70300, // Level 38
  74100, // Level 39
  78000, // Level 40
  82000, // Level 41
  86100, // Level 42
  90300, // Level 43
  94600, // Level 44
  99000, // Level 45
  103500, // Level 46
  108100, // Level 47
  112800, // Level 48
  117600, // Level 49
  122500, // Level 50
]

// Maximum level
export const MAX_LEVEL = 50

/**
 * Calculate the level based on XP
 * @param xp The amount of XP
 * @returns The level (1-50)
 */
export function calculateLevel(xp: number): number {
  if (xp < LEVEL_THRESHOLDS[0]) return 1

  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp < LEVEL_THRESHOLDS[i]) {
      return i
    }
  }

  // If XP exceeds the highest threshold, return the maximum level
  return MAX_LEVEL
}

/**
 * Calculate the progress to the next level (0-100%)
 * @param xp The amount of XP
 * @returns The progress percentage to the next level
 */
export function calculateLevelProgress(xp: number): number {
  const currentLevel = calculateLevel(xp)

  // If at max level, return 100%
  if (currentLevel >= MAX_LEVEL) return 100

  const currentLevelXP = LEVEL_THRESHOLDS[currentLevel - 1]
  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel]

  // Calculate the progress percentage
  return Math.floor(((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
}

/**
 * Calculate the XP needed to reach the next level
 * @param xp The current amount of XP
 * @returns The amount of XP needed to reach the next level
 */
export function calculateXPToNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp)

  // If at max level, return 0
  if (currentLevel >= MAX_LEVEL) return 0

  const nextLevelXP = LEVEL_THRESHOLDS[currentLevel]
  return nextLevelXP - xp
}

/**
 * Calculate the total level based on all skills
 * @param stats Object containing skill XP values
 * @returns The average level across all skills
 */
export function calculateTotalLevel(stats: { [key: string]: number }): number {
  let totalLevel = 0
  for (const skill in stats) {
    totalLevel += calculateLevel(stats[skill])
  }
  return Math.max(1, Math.floor(totalLevel / Object.keys(stats).length))
}

// Add this import at the top of the file:
import { supabase } from "./supabase"

// Cache for level descriptions to avoid excessive database calls
const levelDescriptionCache: Record<number, string> = {}

/**
 * Get the level description from the database
 * @param level The level number
 * @returns The description for that level
 */
export async function getLevelDescription(level: number): Promise<string> {
  // Check cache first
  if (levelDescriptionCache[level]) {
    return levelDescriptionCache[level]
  }

  try {
    const { data, error } = await supabase.from("levels").select("description").eq("level", level).single()

    if (error) {
      console.error("Error fetching level description:", error)
      // Fall back to the hardcoded version if there's an error
      return getDefaultLevelDescription(level)
    }

    if (data && data.description) {
      // Cache the result
      levelDescriptionCache[level] = data.description
      return data.description
    }

    // If no description found, try to find the closest lower level
    const { data: closestData, error: closestError } = await supabase
      .from("levels")
      .select("description")
      .lt("level", level)
      .order("level", { ascending: false })
      .limit(1)
      .single()

    if (closestError || !closestData) {
      return getDefaultLevelDescription(level)
    }

    // Cache the result
    levelDescriptionCache[level] = closestData.description
    return closestData.description
  } catch (error) {
    console.error("Unexpected error fetching level description:", error)
    return getDefaultLevelDescription(level)
  }
}

/**
 * Fallback function for level descriptions when database call fails
 */
function getDefaultLevelDescription(level: number): string {
  if (level >= 50) return "Ultimate"
  if (level >= 45) return "Celestial"
  if (level >= 40) return "Legendary"
  if (level >= 35) return "Glorious"
  if (level >= 30) return "Exalted"
  if (level >= 25) return "Ancient"
  if (level >= 20) return "Cosmic"
  if (level >= 15) return "Transcendent"
  if (level >= 10) return "Champion"
  if (level >= 5) return "Skilled"
  return "Novice"
}

