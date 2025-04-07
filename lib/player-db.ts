import { supabase } from "./supabase"
import { getCurrentUser } from "./utils"
import { calculateTotalLevel } from "./level-system"

export interface PlayerData {
  id: string
  username: string
  level: number
  xp: number
  gold: number
  stats: {
    strength: number
    agility: number
    endurance: number
    speed: number
    flexibility: number
    reactions: number
    brainpower: number
  }
  inventory: {
    avatars: string[]
    hats: string[]
  }
  equipped_avatar: string
  equipped_hat: string | null
  equipped_border: string | null
  battle_progress: {
    wave: number
    monstersDefeated: number
    xp_gained: number
    gold_gained: number
  }
  profile_picture_url: string | null
}

export async function createNewPlayer(email: string): Promise<PlayerData | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const newPlayer: Omit<PlayerData, "id"> = {
    username: email.split("@")[0],
    level: 1,
    xp: 0,
    gold: 100,
    stats: {
      strength: 0,
      agility: 0,
      endurance: 0,
      speed: 0,
      flexibility: 0,
      reactions: 0,
      brainpower: 0,
    },
    inventory: {
      avatars: ["default"],
      hats: [],
    },
    equipped_avatar: "Player.png",
    equipped_hat: null,
    equipped_border: null,
    battle_progress: {
      wave: 1,
      monstersDefeated: 0,
      xp_gained: 0,
      gold_gained: 0,
    },
    profile_picture_url: null,
  }

  try {
    const { data, error } = await supabase
      .from("players")
      .insert({ ...newPlayer, id: user.id })
      .select()
      .single()

    if (error) {
      console.error("Supabase error creating new player:", error)
      return null
    }

    if (!data) {
      console.error("No data returned when creating new player")
      return null
    }

    return data
  } catch (error) {
    console.error("Unexpected error creating new player:", error)
    return null
  }
}

export async function updatePlayerData(playerId: string, updates: Partial<PlayerData>): Promise<boolean> {
  try {
    console.log("Updating player data for:", playerId)
    console.log("Updates:", updates)

    // Filter out properties that might not exist in the database schema
    const safeUpdates = { ...updates }
    if ("equipped_border" in safeUpdates && !(await columnExists("players", "equipped_border"))) {
      delete safeUpdates.equipped_border
      console.log("Skipping equipped_border update as column doesn't exist in database")
    }

    // Always recalculate and include the level when updating player data
    if (updates.stats) {
      const newLevel = calculateTotalLevel(updates.stats)
      safeUpdates.level = newLevel
      console.log("Calculated new level:", newLevel)
    }

    const { error } = await supabase.from("players").update(safeUpdates).eq("id", playerId)

    if (error) {
      console.error("Supabase error updating player data:", error)
      return false
    }

    console.log("Player data updated successfully")
    return true
  } catch (error) {
    console.error("Unexpected error updating player data:", error)
    return false
  }
}

export async function getPlayerData(playerId: string): Promise<PlayerData | null> {
  try {
    console.log("Getting player data for:", playerId)
    const { data, error } = await supabase.from("players").select("*").eq("id", playerId).single()

    if (error) {
      console.error("Supabase error fetching player data:", error)
      return null
    }

    if (!data) {
      console.error("No data returned when fetching player data")
      return null
    }

    // Always calculate the current level based on stats
    const currentLevel = calculateTotalLevel(data.stats)
    console.log("Calculated current level:", currentLevel)

    // Update the level in the database if it's different
    if (data.level !== currentLevel) {
      console.log("Updating stored level from", data.level, "to", currentLevel)
      await supabase.from("players").update({ level: currentLevel }).eq("id", playerId)
    }

    return {
      ...data,
      level: currentLevel, // Always use the calculated level
    }
  } catch (error) {
    console.error("Unexpected error fetching player data:", error)
    return null
  }
}

export async function getPlayerDataById(playerId: string): Promise<PlayerData | null> {
  try {
    const { data, error } = await supabase.from("players").select("*").eq("id", playerId).single()

    if (error) {
      console.error("Error fetching player data:", error)
      return null
    }

    // Handle case where borders array doesn't exist in older player data
    if (!data.inventory.borders) {
      data.inventory.borders = []
      data.equipped_border = null
    }

    // Calculate the player's level based on their stats using the new level system
    const totalLevel = calculateTotalLevel(data.stats)

    return {
      ...data,
      level: totalLevel,
    }
  } catch (error) {
    console.error("Unexpected error fetching player data:", error)
    return null
  }
}

async function columnExists(table: string, column: string): Promise<boolean> {
  try {
    // This is a simple check - we try to select just that column
    const { error } = await supabase.from(table).select(column).limit(1)

    return !error
  } catch (error) {
    console.error(`Error checking if column ${column} exists in ${table}:`, error)
    return false
  }
}

