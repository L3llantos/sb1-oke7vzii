import { supabase } from "./supabase"
import { completeTask } from "./daily-tasks"

/**
 * Manually check and complete the "Try Something New" task
 * This is useful for testing or fixing issues with task completion
 */
export async function checkAndCompleteNewActivityTask(userId: string, activityName: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0]

    // First, check if the activity is new (not logged in the past 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString()

    // Check activity history
    const { count, error: countError } = await supabase
      .from("user_activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("name", activityName)
      .gte("created_at", sevenDaysAgoStr)

    if (countError) {
      console.error("Error checking activity history:", countError)
      return false
    }

    const isNewActivity = count === 0
    console.log(`Is ${activityName} a new activity? ${isNewActivity} (found ${count} entries in the past 7 days)`)

    if (!isNewActivity) {
      console.log("Activity is not new, cannot complete 'Try Something New' task")
      return false
    }

    // Find the "Try Something New" task
    const { data: tasks, error: tasksError } = await supabase
      .from("user_daily_tasks")
      .select(`
        id,
        task_id,
        completed,
        daily_tasks (
          id,
          title,
          description
        )
      `)
      .eq("user_id", userId)
      .eq("assigned_date", today)
      .eq("completed", false)

    if (tasksError) {
      console.error("Error fetching daily tasks:", tasksError)
      return false
    }

    // Find the "Try Something New" task
    const newActivityTask = tasks?.find((task) =>
      task.daily_tasks.description.toLowerCase().includes("try something new"),
    )

    if (!newActivityTask) {
      console.log("No 'Try Something New' task found for today")
      return false
    }

    // Complete the task
    const success = await completeTask(userId, newActivityTask.daily_tasks.id)

    if (success) {
      console.log(`Successfully completed 'Try Something New' task with activity: ${activityName}`)
      return true
    } else {
      console.error("Failed to complete 'Try Something New' task")
      return false
    }
  } catch (error) {
    console.error("Error in checkAndCompleteNewActivityTask:", error)
    return false
  }
}

/**
 * Manually check and complete the "Sports activity with rapid movements" task
 */
export async function checkAndCompleteSportsTask(userId: string, activityName: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0]

    // Check if the activity is a sport with rapid movements
    const rapidMovementSports = [
      "dodgeball",
      "basketball",
      "tennis",
      "badminton",
      "squash",
      "handball",
      "table tennis",
      "volleyball",
      "soccer",
      "football",
      "hockey",
      "rugby",
      "martial arts",
      "boxing",
      "kickboxing",
      "fencing",
      "racquetball",
    ]

    const isRapidMovementSport = rapidMovementSports.some((sport) =>
      activityName.toLowerCase().includes(sport.toLowerCase()),
    )

    if (!isRapidMovementSport) {
      console.log(`${activityName} is not recognized as a sport with rapid movements`)
      return false
    }

    // Find the sports task
    const { data: tasks, error: tasksError } = await supabase
      .from("user_daily_tasks")
      .select(`
        id,
        task_id,
        completed,
        daily_tasks (
          id,
          title,
          description
        )
      `)
      .eq("user_id", userId)
      .eq("assigned_date", today)
      .eq("completed", false)

    if (tasksError) {
      console.error("Error fetching daily tasks:", tasksError)
      return false
    }

    // Find the sports task with rapid movements
    const sportsTask = tasks?.find(
      (task) =>
        task.daily_tasks.description.toLowerCase().includes("sports activity") &&
        task.daily_tasks.description.toLowerCase().includes("rapid movements"),
    )

    if (!sportsTask) {
      console.log("No 'Sports activity with rapid movements' task found for today")
      return false
    }

    // Complete the task
    const success = await completeTask(userId, sportsTask.daily_tasks.id)

    if (success) {
      console.log(`Successfully completed 'Sports activity with rapid movements' task with activity: ${activityName}`)
      return true
    } else {
      console.error("Failed to complete 'Sports activity with rapid movements' task")
      return false
    }
  } catch (error) {
    console.error("Error in checkAndCompleteSportsTask:", error)
    return false
  }
}

