import { supabase } from "./supabase"
import { getPlayerData, updatePlayerData } from "./player-db"
import { checkTaskCompletion } from "./daily-tasks"
import { checkAchievementsAfterActivity } from "./achievement-checker"
import { saveOfflineActivity, requestBackgroundSync } from "@/utils/offline-storage"

export interface ActivityDefinition {
  id: string
  name: string
  category: string
  strength_xp: number
  endurance_xp: number
  agility_xp: number
  flexibility_xp: number
  speed_xp: number
  reactions_xp: number
  brainpower_xp: number
}

export interface Activity {
  id: string
  user_id: string
  name: string
  activity_id: string
  duration: number
  intensity: number
  xp_gained: Record<string, number>
  created_at: string
}

export async function getActivityDefinitions(): Promise<ActivityDefinition[]> {
  const { data, error } = await supabase.from("activities").select("*")

  if (error) {
    console.error("Error fetching activity definitions:", error)
    return []
  }

  return data || []
}

export async function getRecentActivities(userId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("user_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching recent activities:", error)
    return []
  }

  return data || []
}

export async function logActivity(
  userId: string,
  activityData: {
    name: string
    activity_id?: string
    duration: number
    intensity: number
    xp_gained: Record<string, number>
  },
): Promise<boolean> {
  console.log("Logging activity for user:", userId)
  console.log("Activity data:", activityData)

  // Check if we're online
  if (!navigator.onLine) {
    console.log("Device is offline, saving activity for later sync")

    // Save activity for offline use
    await saveOfflineActivity({
      id: crypto.randomUUID(),
      userId,
      name: activityData.name,
      duration: activityData.duration,
      intensity: activityData.intensity,
      xp_gained: activityData.xp_gained,
      created_at: new Date().toISOString(),
    })

    // Request background sync when online
    requestBackgroundSync()

    // Return true to indicate the activity was "logged" (albeit offline)
    return true
  }

  // Insert activity into user_activities table
  const { error } = await supabase.from("user_activities").insert({
    user_id: userId,
    name: activityData.name,
    activity_id: activityData.activity_id || null,
    duration: activityData.duration,
    intensity: activityData.intensity,
    xp_gained: activityData.xp_gained,
  })

  if (error) {
    console.error("Error logging activity:", error)
    return false
  }

  // Get current player data
  const player = await getPlayerData(userId)
  if (!player) {
    console.error("Player not found")
    return false
  }

  console.log("Current player stats:", player.stats)

  // Update player stats with the XP gained
  const updatedStats = { ...player.stats }
  let totalXpGained = 0

  // For each skill in xp_gained, add to the corresponding player stat
  for (const [skill, xp] of Object.entries(activityData.xp_gained)) {
    // Make sure the skill exists in player stats
    if (skill in updatedStats) {
      updatedStats[skill as keyof typeof updatedStats] += xp
      totalXpGained += xp
    } else {
      console.warn(`Skill ${skill} not found in player stats`)
    }
  }

  // Calculate gold reward based on duration and intensity, but with reduced rate
  // Original formula might have been something like: duration * (intensity / 5)
  // Now we'll reduce it by 50%
  const goldReward = Math.floor(activityData.duration * (activityData.intensity / 10) * 0.5)

  console.log("Updated player stats:", updatedStats)
  console.log("Total XP gained:", totalXpGained)
  console.log("Gold reward:", goldReward)

  // Update player data in the database
  const updatedPlayer = {
    ...player,
    stats: updatedStats,
    xp: player.xp + totalXpGained,
    gold: player.gold + goldReward,
  }

  const success = await updatePlayerData(userId, updatedPlayer)
  if (!success) {
    console.error("Failed to update player stats after logging activity")
    return false
  }

  // Check for achievements after logging activity
  try {
    const unlockedAchievements = await checkAchievementsAfterActivity(userId, activityData, updatedPlayer)

    if (unlockedAchievements.length > 0) {
      console.log("Unlocked achievements:", unlockedAchievements)
    } else {
      console.log("No new achievements unlocked")
    }
  } catch (error) {
    console.error("Error checking achievements:", error)
    // Don't fail the activity logging if achievement checking fails
  }

  // Check for daily task completion after logging activity
  try {
    const completedTasks = await checkTaskCompletion(userId, activityData)

    if (completedTasks.length > 0) {
      console.log("Completed daily tasks:", completedTasks)
    } else {
      console.log("No daily tasks completed")
    }
  } catch (error) {
    console.error("Error checking daily tasks:", error)
    // Don't fail the activity logging if task checking fails
  }

  return true
}

export async function deleteActivity(userId: string, activityId: string): Promise<boolean> {
  console.log(`Attempting to delete activity ${activityId} for user ${userId}`)

  // First, get the activity details to know what XP to reverse
  const { data: activity, error: fetchError } = await supabase
    .from("user_activities")
    .select("*")
    .eq("id", activityId)
    .eq("user_id", userId) // Security check to ensure users can only delete their own activities
    .single()

  if (fetchError) {
    console.error("Error fetching activity to delete:", fetchError)
    return false
  }

  if (!activity) {
    console.error("Activity not found or doesn't belong to user")
    return false
  }

  console.log("Found activity to delete:", activity)

  // Delete the activity
  const { error: deleteError } = await supabase
    .from("user_activities")
    .delete()
    .eq("id", activityId)
    .eq("user_id", userId)

  if (deleteError) {
    console.error("Error deleting activity:", deleteError)
    return false
  }

  console.log("Activity deleted successfully")

  // Reverse the XP gains from the player's stats
  const player = await getPlayerData(userId)
  if (player) {
    const updatedStats = { ...player.stats }
    let totalXpReduction = 0

    for (const [skill, xp] of Object.entries(activity.xp_gained)) {
      updatedStats[skill as keyof typeof updatedStats] -= xp
      // Ensure stats don't go below 0
      if (updatedStats[skill as keyof typeof updatedStats] < 0) {
        updatedStats[skill as keyof typeof updatedStats] = 0
      }
      totalXpReduction += xp
    }

    const updatedPlayer = {
      ...player,
      stats: updatedStats,
      xp: Math.max(0, player.xp - totalXpReduction), // Ensure XP doesn't go below 0
    }

    console.log("Updating player stats after deletion:", {
      oldStats: player.stats,
      newStats: updatedStats,
      oldXp: player.xp,
      newXp: updatedPlayer.xp,
    })

    const success = await updatePlayerData(player.id, updatedPlayer)
    if (!success) {
      console.error("Failed to update player stats after deleting activity")
    }
  }

  return true
}

