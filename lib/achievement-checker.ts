import { supabase } from "./supabase"
import { unlockAchievement } from "./achievement-db"
import type { PlayerData } from "./player-db"

// Main function to check achievements after logging an activity
export async function checkAchievementsAfterActivity(
  userId: string,
  activityData: {
    name: string
    duration: number
    intensity: number
    xp_gained: Record<string, number>
  },
  playerData: PlayerData,
): Promise<string[]> {
  const unlockedAchievements: string[] = []

  try {
    console.log("Checking achievements for user:", userId)
    console.log("Activity data:", activityData)
    console.log("Player stats:", playerData.stats)

    // Get all achievements from the database
    const { data: achievements, error } = await supabase.from("achievements").select("*")

    if (error) {
      console.error("Error fetching achievements:", error)
      return []
    }

    if (!achievements || achievements.length === 0) {
      console.warn("No achievements found in database")
      return []
    }

    console.log(`Found ${achievements.length} achievements to check`)

    // Determine the activity category
    const activityCategory = determineActivityCategory(activityData.name)
    console.log("Determined activity category:", activityCategory)

    // Get user's already unlocked achievements to avoid duplicates
    const { data: userAchievements, error: userAchievError } = await supabase
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", userId)

    if (userAchievError) {
      console.error("Error fetching user achievements:", userAchievError)
      return []
    }

    const unlockedAchievementIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || [])
    console.log("User already has unlocked:", unlockedAchievementIds.size, "achievements")

    // Check each achievement
    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedAchievementIds.has(achievement.id)) {
        continue
      }

      let shouldUnlock = false
      let matchReason = ""

      // Only process achievements for the relevant category or general achievements
      if (achievement.category.toLowerCase() === activityCategory.toLowerCase() || achievement.category === "General") {
        // XP milestone achievements
        if (achievement.description.includes("total") && achievement.description.includes("XP")) {
          const skillName = achievement.category.toLowerCase()
          const requiredXP = extractNumberFromDescription(achievement.description)
          const currentXP = playerData.stats[skillName as keyof typeof playerData.stats]

          if (currentXP >= requiredXP) {
            shouldUnlock = true
            matchReason = `XP milestone: ${currentXP}/${requiredXP} ${skillName} XP`
          }
        }

        // Intensity achievements
        else if (achievement.description.includes("intensity")) {
          const requiredIntensity = extractNumberFromDescription(achievement.description)

          if (activityData.intensity >= requiredIntensity) {
            shouldUnlock = true
            matchReason = `Intensity: ${activityData.intensity}/${requiredIntensity}`
          }
        }

        // Duration achievements
        else if (achievement.description.includes("minute")) {
          const requiredDuration = extractNumberFromDescription(achievement.description)

          if (activityData.duration >= requiredDuration) {
            shouldUnlock = true
            matchReason = `Duration: ${activityData.duration}/${requiredDuration} minutes`
          }
        }

        // If conditions are met, unlock the achievement
        if (shouldUnlock) {
          console.log(`Unlocking achievement: ${achievement.name} - ${matchReason}`)
          const success = await unlockAchievement(userId, achievement.id)

          if (success) {
            unlockedAchievements.push(achievement.name)
            console.log(`Successfully unlocked: ${achievement.name}`)
          }
        }
      }
    }

    // Now check for activity count achievements (requires a separate query)
    await checkActivityCountAchievements(
      userId,
      activityCategory,
      achievements,
      unlockedAchievementIds,
      unlockedAchievements,
    )

    return unlockedAchievements
  } catch (error) {
    console.error("Error in checkAchievementsAfterActivity:", error)
    return []
  }
}

// Helper function to check achievements based on activity counts
async function checkActivityCountAchievements(
  userId: string,
  activityCategory: string,
  achievements: any[],
  unlockedAchievementIds: Set<string>,
  unlockedAchievements: string[],
): Promise<void> {
  try {
    // Count activities by category
    const { data: activities, error } = await supabase.from("user_activities").select("name").eq("user_id", userId)

    if (error) {
      console.error("Error fetching user activities:", error)
      return
    }

    // Count activities by category
    const categoryCounts: Record<string, number> = {}

    for (const activity of activities || []) {
      const category = determineActivityCategory(activity.name)
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    }

    console.log("Activity counts by category:", categoryCounts)

    // Check count-based achievements
    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedAchievementIds.has(achievement.id)) {
        continue
      }

      // Only check relevant category
      if (achievement.category.toLowerCase() === activityCategory.toLowerCase()) {
        // Activity count achievements
        if (achievement.description.includes("Complete") && achievement.description.includes("activities")) {
          const requiredCount = extractNumberFromDescription(achievement.description)
          const currentCount = categoryCounts[activityCategory] || 0

          if (currentCount >= requiredCount) {
            console.log(
              `Unlocking count achievement: ${achievement.name} - ${currentCount}/${requiredCount} activities`,
            )
            const success = await unlockAchievement(userId, achievement.id)

            if (success) {
              unlockedAchievements.push(achievement.name)
              console.log(`Successfully unlocked: ${achievement.name}`)
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in checkActivityCountAchievements:", error)
  }
}

// Helper function to extract a number from a description
function extractNumberFromDescription(description: string): number {
  const matches = description.match(/\d+/)
  return matches ? Number.parseInt(matches[0], 10) : 0
}

// Helper function to determine category from activity name
function determineActivityCategory(activityName: string): string {
  const name = activityName.toLowerCase()

  if (
    name.includes("strength") ||
    name.includes("weight") ||
    name.includes("dumbbell") ||
    name.includes("kettlebell") ||
    name.includes("resistance") ||
    name.includes("bodyweight")
  ) {
    return "Strength"
  } else if (
    name.includes("cardio") ||
    name.includes("run") ||
    name.includes("jog") ||
    name.includes("cycling") ||
    name.includes("swim") ||
    name.includes("rowing")
  ) {
    return "Endurance"
  } else if (
    name.includes("yoga") ||
    name.includes("stretch") ||
    name.includes("pilates") ||
    name.includes("mobility")
  ) {
    return "Flexibility"
  } else if (
    name.includes("agility") ||
    name.includes("jump") ||
    name.includes("ladder") ||
    name.includes("footwork")
  ) {
    return "Agility"
  } else if (name.includes("speed") || name.includes("sprint") || name.includes("dash") || name.includes("quick")) {
    return "Speed"
  } else if (
    name.includes("reaction") ||
    name.includes("reflex") ||
    name.includes("response") ||
    name.includes("martial")
  ) {
    return "Reaction"
  } else if (
    name.includes("mind") ||
    name.includes("brain") ||
    name.includes("meditation") ||
    name.includes("chess") ||
    name.includes("puzzle")
  ) {
    return "Brainpower"
  }

  // Default to a general category
  return "General"
}

// Function to manually check all achievements for a user
export async function checkAllAchievements(userId: string): Promise<string[]> {
  try {
    console.log("Manually checking all achievements for user:", userId)

    // Get player data
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("id", userId)
      .single()

    if (playerError) {
      console.error("Error fetching player data:", playerError)
      return []
    }

    // Get all user activities
    const { data: activities, error: activitiesError } = await supabase
      .from("user_activities")
      .select("*")
      .eq("user_id", userId)

    if (activitiesError) {
      console.error("Error fetching user activities:", activitiesError)
      return []
    }

    console.log(`Found ${activities?.length || 0} activities to process`)

    // Process each activity to check achievements
    const unlockedAchievements: string[] = []

    // First, check XP-based achievements
    for (const skill of ["strength", "agility", "endurance", "speed", "flexibility", "reactions", "brainpower"]) {
      const skillXP = playerData.stats[skill]
      const category = skill.charAt(0).toUpperCase() + skill.slice(1)

      // Create a dummy activity to check XP-based achievements
      const dummyActivity = {
        name: `${category} Activity`,
        duration: 30,
        intensity: 5,
        xp_gained: { [skill]: 0 },
      }

      const newAchievements = await checkAchievementsAfterActivity(userId, dummyActivity, playerData)
      unlockedAchievements.push(...newAchievements)
    }

    // Then check activity-specific achievements
    for (const activity of activities || []) {
      const activityData = {
        name: activity.name,
        duration: activity.duration,
        intensity: activity.intensity,
        xp_gained: activity.xp_gained,
      }

      const newAchievements = await checkAchievementsAfterActivity(userId, activityData, playerData)

      // Add unique achievements only
      for (const achievement of newAchievements) {
        if (!unlockedAchievements.includes(achievement)) {
          unlockedAchievements.push(achievement)
        }
      }
    }

    return unlockedAchievements
  } catch (error) {
    console.error("Error in checkAllAchievements:", error)
    return []
  }
}

