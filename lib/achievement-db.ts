import { supabase } from "./supabase"

export interface Achievement {
  id: string
  name: string
  description: string
  category: string
  icon: string
  xp_reward: number
}

export interface UserAchievement {
  achievement_id: string
  completed_at: string
}

export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase.from("achievements").select("*")
  if (error) {
    console.error("Error fetching achievements:", error)
    return []
  }
  return data || []
}

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("achievement_id, completed_at")
    .eq("user_id", userId)
  if (error) {
    console.error("Error fetching user achievements:", error)
    return []
  }
  return data || []
}

export async function unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
  // First, check if the achievement is already unlocked
  const { data: existingAchievement, error: checkError } = await supabase
    .from("user_achievements")
    .select()
    .eq("user_id", userId)
    .eq("achievement_id", achievementId)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking existing achievement:", checkError)
    return false
  }

  // If the achievement is already unlocked, return true (success)
  if (existingAchievement) {
    console.log("Achievement already unlocked:", achievementId)
    return true
  }

  // If the achievement is not yet unlocked, insert it
  const { error } = await supabase.from("user_achievements").insert({ user_id: userId, achievement_id: achievementId })

  if (error) {
    console.error("Error unlocking achievement:", error)
    return false
  }

  console.log("Achievement unlocked successfully:", achievementId)
  return true
}

