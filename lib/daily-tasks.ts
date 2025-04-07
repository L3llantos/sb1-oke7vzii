import { supabase } from "./supabase"
import { getCurrentUser } from "./utils"

export interface DailyTask {
  id: string
  title: string
  description: string
  category: string
  xp_reward: number
  gold_reward: number
  difficulty: number
  required_value: number | null
  completed?: boolean
}

export interface UserDailyTask extends DailyTask {
  assigned_date: string
  completed: boolean
  completed_at: string | null
}

/**
 * Get today's daily tasks for the current user
 */
export async function getUserDailyTasks(userId?: string): Promise<UserDailyTask[]> {
  try {
    // Get user ID if not provided
    if (!userId) {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error("User not found")
      }
      userId = user.id
    }

    const today = new Date().toISOString().split("T")[0] // Format: YYYY-MM-DD

    // Check if user already has tasks assigned for today
    const { data: existingTasks, error: existingTasksError } = await supabase
      .from("user_daily_tasks")
      .select(`
        id,
        assigned_date,
        completed,
        completed_at,
        daily_tasks (
          id,
          title,
          description,
          category,
          xp_reward,
          gold_reward,
          difficulty,
          required_value
        )
      `)
      .eq("user_id", userId)
      .eq("assigned_date", today)

    if (existingTasksError) {
      console.error("Error fetching existing daily tasks:", existingTasksError)
      throw existingTasksError
    }

    // If user already has tasks for today, return them
    if (existingTasks && existingTasks.length > 0) {
      return existingTasks.map((task) => ({
        id: task.daily_tasks.id,
        title: task.daily_tasks.title,
        description: task.daily_tasks.description,
        category: task.daily_tasks.category,
        xp_reward: task.daily_tasks.xp_reward,
        gold_reward: task.daily_tasks.gold_reward,
        difficulty: task.daily_tasks.difficulty,
        required_value: task.daily_tasks.required_value,
        assigned_date: task.assigned_date,
        completed: task.completed,
        completed_at: task.completed_at,
      }))
    }

    // If no tasks for today, assign 5 random tasks
    return await assignDailyTasks(userId)
  } catch (error) {
    console.error("Error in getUserDailyTasks:", error)
    throw error
  }
}

/**
 * Assign 5 random daily tasks to the user for today
 */
async function assignDailyTasks(userId: string): Promise<UserDailyTask[]> {
  try {
    console.log("Assigning new daily tasks for user:", userId)

    // Get all available tasks
    const { data: allTasks, error: tasksError } = await supabase.from("daily_tasks").select("*")

    if (tasksError) {
      console.error("Error fetching daily tasks:", tasksError)
      throw tasksError
    }

    if (!allTasks || allTasks.length === 0) {
      console.error("No daily tasks found in the database")
      return []
    }

    // Randomly select 5 tasks with a good balance of categories
    const selectedTasks = selectBalancedTasks(allTasks, 5)
    const today = new Date().toISOString().split("T")[0] // Format: YYYY-MM-DD

    // Prepare tasks for insertion
    const tasksToInsert = selectedTasks.map((task) => ({
      user_id: userId,
      task_id: task.id,
      assigned_date: today,
      completed: false,
    }))

    // Insert the tasks into user_daily_tasks
    const { error: insertError } = await supabase.from("user_daily_tasks").insert(tasksToInsert)

    if (insertError) {
      console.error("Error assigning daily tasks:", insertError)
      throw insertError
    }

    // Return the assigned tasks with the correct format
    return selectedTasks.map((task) => ({
      ...task,
      assigned_date: today,
      completed: false,
      completed_at: null,
    }))
  } catch (error) {
    console.error("Error in assignDailyTasks:", error)
    throw error
  }
}

/**
 * Select a balanced set of tasks from different categories
 */
function selectBalancedTasks(tasks: DailyTask[], count: number): DailyTask[] {
  // Group tasks by category
  const tasksByCategory: Record<string, DailyTask[]> = {}

  tasks.forEach((task) => {
    if (!tasksByCategory[task.category]) {
      tasksByCategory[task.category] = []
    }
    tasksByCategory[task.category].push(task)
  })

  const categories = Object.keys(tasksByCategory)
  const selectedTasks: DailyTask[] = []

  // First, select one task from each category (if possible)
  const categoryCount = Math.min(categories.length, count)

  // Shuffle the categories for randomness
  const shuffledCategories = [...categories].sort(() => Math.random() - 0.5)

  for (let i = 0; i < categoryCount; i++) {
    const category = shuffledCategories[i]
    const categoryTasks = tasksByCategory[category]

    // Pick a random task from this category
    const randomIndex = Math.floor(Math.random() * categoryTasks.length)
    selectedTasks.push(categoryTasks[randomIndex])

    // Remove the selected task to avoid duplicates
    categoryTasks.splice(randomIndex, 1)
  }

  // If we need more tasks, pick randomly from all remaining tasks
  const remainingTasksNeeded = count - selectedTasks.length

  if (remainingTasksNeeded > 0) {
    // Flatten all remaining tasks
    const remainingTasks = Object.values(tasksByCategory).flat()

    // Shuffle the remaining tasks
    const shuffledRemaining = [...remainingTasks].sort(() => Math.random() - 0.5)

    // Add the needed number of tasks
    for (let i = 0; i < Math.min(remainingTasksNeeded, shuffledRemaining.length); i++) {
      selectedTasks.push(shuffledRemaining[i])
    }
  }

  return selectedTasks
}

// Modify the checkTaskCompletion function to reduce gold rewards
export async function completeTask(userId: string, taskId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0]
    const now = new Date().toISOString()

    // Get the task details to award the correct rewards
    const { data: taskData, error: taskError } = await supabase
      .from("user_daily_tasks")
      .select(`
        id,
        completed,
        daily_tasks (
          id,
          xp_reward,
          gold_reward
        )
      `)
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .eq("assigned_date", today)
      .single()

    if (taskError) {
      console.error("Error fetching task for completion:", taskError)
      return false
    }

    // If task is already completed, don't do anything
    if (taskData.completed) {
      console.log("Task already completed")
      return true
    }

    // Mark the task as completed
    const { error: updateError } = await supabase
      .from("user_daily_tasks")
      .update({
        completed: true,
        completed_at: now,
      })
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .eq("assigned_date", today)

    if (updateError) {
      console.error("Error marking task as completed:", updateError)
      return false
    }

    // Award the user with XP and gold (reduced gold by 40%)
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("gold, xp")
      .eq("id", userId)
      .single()

    if (playerError) {
      console.error("Error fetching player data:", playerError)
      return false
    }

    // Apply a 40% reduction to gold rewards
    const goldReward = Math.floor(taskData.daily_tasks.gold_reward * 0.6)
    const updatedGold = playerData.gold + goldReward
    const updatedXp = playerData.xp + taskData.daily_tasks.xp_reward

    const { error: updatePlayerError } = await supabase
      .from("players")
      .update({
        gold: updatedGold,
        xp: updatedXp,
      })
      .eq("id", userId)

    if (updatePlayerError) {
      console.error("Error updating player rewards:", updatePlayerError)
      return false
    }

    console.log(
      `Task completed successfully. Awarded ${taskData.daily_tasks.xp_reward} XP and ${goldReward} gold (reduced from ${taskData.daily_tasks.gold_reward}).`,
    )
    return true
  } catch (error) {
    console.error("Error in completeTask:", error)
    return false
  }
}

/**
 * Check if a task should be automatically completed based on an activity
 */
export async function checkTaskCompletion(
  userId: string,
  activityData: {
    name: string
    duration: number
    intensity: number
    xp_gained: Record<string, number>
  },
): Promise<string[]> {
  try {
    const completedTasks: string[] = []
    const today = new Date().toISOString().split("T")[0]

    // Get today's tasks that aren't completed yet
    const { data: userTasks, error: tasksError } = await supabase
      .from("user_daily_tasks")
      .select(`
       id,
       task_id,
       completed,
       daily_tasks (
         id,
         title,
         description,
         category,
         required_value
       )
     `)
      .eq("user_id", userId)
      .eq("assigned_date", today)
      .eq("completed", false)

    if (tasksError) {
      console.error("Error fetching user tasks:", tasksError)
      return []
    }

    if (!userTasks || userTasks.length === 0) {
      return []
    }

    // Determine the category of the logged activity
    const activityCategory = getCategoryFromActivity(activityData.name)
    console.log(`Activity ${activityData.name} categorized as: ${activityCategory}`)

    // Check if this is a new activity for the user (for "Try Something New" task)
    const isNewActivity = await checkIfNewActivity(userId, activityData.name)
    console.log(`Is ${activityData.name} a new activity? ${isNewActivity}`)

    // Calculate total XP gained per skill
    const totalXpBySkill: Record<string, number> = {}
    for (const [skill, xp] of Object.entries(activityData.xp_gained)) {
      totalXpBySkill[skill] = xp
    }

    // Check each task to see if it should be completed
    for (const userTask of userTasks) {
      const task = userTask.daily_tasks
      let shouldComplete = false
      let completionReason = ""

      // Check for activity duration tasks
      if (task.description.includes("minutes duration") && task.required_value) {
        if (activityData.duration >= task.required_value) {
          // Check if the category is specified
          if (task.category === "Activity" || task.category.toLowerCase() === activityCategory.toLowerCase()) {
            shouldComplete = true
            completionReason = `Duration requirement met: ${activityData.duration} >= ${task.required_value} minutes`
          }
        }
      }

      // Check for intensity tasks
      else if (task.description.includes("intensity") && task.required_value) {
        if (activityData.intensity >= task.required_value) {
          // Check if the category is specified
          if (task.category === "Activity" || task.category.toLowerCase() === activityCategory.toLowerCase()) {
            shouldComplete = true
            completionReason = `Intensity requirement met: ${activityData.intensity} >= ${task.required_value}`
          }
        }
      }

      // Check for category-specific activity tasks
      else if (task.description.includes("Log a") || task.description.includes("Log an")) {
        // Check for specific activity name match
        if (task.description.toLowerCase().includes(activityData.name.toLowerCase())) {
          shouldComplete = true
          completionReason = `Activity name matched: ${activityData.name}`
        }
        // Check for sports activities with rapid movements
        else if (
          task.description.toLowerCase().includes("sports activity") &&
          task.description.toLowerCase().includes("rapid movements") &&
          activityCategory === "Sports" &&
          isActivityWithRapidMovements(activityData.name)
        ) {
          shouldComplete = true
          completionReason = `${activityData.name} recognized as a sports activity with rapid movements`
        }
        // Check for general category match
        else if (
          task.description.toLowerCase().includes(activityCategory.toLowerCase()) ||
          (task.category !== "Activity" && task.category.toLowerCase() === activityCategory.toLowerCase())
        ) {
          shouldComplete = true
          completionReason = `Activity category matched: ${activityCategory}`
        }
      }

      // Check for "Try Something New" task
      else if (task.description.toLowerCase().includes("try something new")) {
        // Only check if it's a new activity if the task description includes "try something new"
        if (isNewActivity) {
          shouldComplete = true
          completionReason = `New activity logged: ${activityData.name} (not logged in the past 7 days)`
        } else {
          console.log(`Task "${task.title}" not completed: ${activityData.name} has been logged within the past 7 days`)
        }
      }

      // Check for XP gain tasks
      else if (
        task.description.includes("Earn at least") &&
        task.description.includes("XP today") &&
        task.required_value
      ) {
        const skillName = task.category.toLowerCase()
        const xpGained = totalXpBySkill[skillName] || 0

        if (xpGained >= task.required_value) {
          shouldComplete = true
          completionReason = `XP requirement met: ${xpGained} >= ${task.required_value} for ${skillName}`
        }
      }

      // If conditions are met, mark the task as completed
      if (shouldComplete) {
        console.log(`Completing task "${task.title}": ${completionReason}`)
        const success = await completeTask(userId, task.id)
        if (success) {
          completedTasks.push(task.title)
        }
      }
    }

    return completedTasks
  } catch (error) {
    console.error("Error checking task completion:", error)
    return []
  }
}

/**
 * Check if an activity has rapid movements (for sports tasks)
 */
function isActivityWithRapidMovements(activityName: string): boolean {
  const rapidMovementActivities = [
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

  return rapidMovementActivities.some((activity) => activityName.toLowerCase().includes(activity.toLowerCase()))
}

/**
 * Check if this is a new activity for the user (not logged in the past 7 days)
 */
async function checkIfNewActivity(userId: string, activityName: string): Promise<boolean> {
  try {
    // Get the date 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString()

    // Use a COUNT query for efficiency
    const { count, error } = await supabase
      .from("user_activities")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("name", activityName)
      .gte("created_at", sevenDaysAgoStr)

    if (error) {
      console.error("Error checking activity history:", error)
      return false // Default to false on error
    }

    console.log(`Activity history check for ${activityName}: Found ${count} entries in the past 7 days`)

    // If count is 0, this is a new activity
    return count === 0
  } catch (error) {
    console.error("Error in checkIfNewActivity:", error)
    return false // Default to false on error
  }
}

/**
 * Convert an activity name to a skill category
 */
function getCategoryFromActivity(activityName: string): string {
  const name = activityName.toLowerCase()

  // Sports activities
  const sportsActivities = [
    "basketball",
    "soccer",
    "tennis",
    "volleyball",
    "martial arts",
    "baseball",
    "football",
    "hockey",
    "golf",
    "badminton",
    "table tennis",
    "rugby",
    "cricket",
    "handball",
    "squash",
    "dodgeball",
    "frisbee",
    "lacrosse",
    "racquetball",
    "fencing",
  ]

  if (sportsActivities.some((sport) => name.includes(sport))) {
    return "Sports"
  }

  // Strength activities
  if (
    name.includes("strength") ||
    name.includes("weight") ||
    name.includes("dumbbell") ||
    name.includes("kettlebell") ||
    name.includes("resistance") ||
    name.includes("bodyweight") ||
    name.includes("powerlifting") ||
    name.includes("crossfit") ||
    name.includes("calisthenics") ||
    name.includes("strongman")
  ) {
    return "Strength"
  }

  // Cardio activities
  else if (
    name.includes("cardio") ||
    name.includes("run") ||
    name.includes("jog") ||
    name.includes("cycling") ||
    name.includes("swim") ||
    name.includes("rowing") ||
    name.includes("hiit") ||
    name.includes("stair") ||
    name.includes("elliptical") ||
    name.includes("aerobics") ||
    name.includes("spinning") ||
    name.includes("kickboxing") ||
    name.includes("dancing") ||
    name.includes("hiking") ||
    name.includes("walking")
  ) {
    return "Endurance"
  }

  // Flexibility activities
  else if (
    name.includes("yoga") ||
    name.includes("stretch") ||
    name.includes("pilates") ||
    name.includes("mobility") ||
    name.includes("tai chi") ||
    name.includes("barre") ||
    name.includes("gymnastics") ||
    name.includes("ballet") ||
    name.includes("foam rolling")
  ) {
    return "Flexibility"
  }

  // Agility activities
  else if (
    name.includes("agility") ||
    name.includes("jump") ||
    name.includes("ladder") ||
    name.includes("footwork") ||
    name.includes("plyometric")
  ) {
    return "Agility"
  }

  // Speed activities
  else if (name.includes("speed") || name.includes("sprint") || name.includes("dash") || name.includes("quick")) {
    return "Speed"
  }

  // Reaction activities
  else if (
    name.includes("reaction") ||
    name.includes("reflex") ||
    name.includes("response") ||
    name.includes("martial")
  ) {
    return "Reaction"
  }

  // Mind activities
  else if (
    name.includes("mind") ||
    name.includes("brain") ||
    name.includes("meditation") ||
    name.includes("chess") ||
    name.includes("puzzle") ||
    name.includes("qigong") ||
    name.includes("breathwork") ||
    name.includes("visualization") ||
    name.includes("mindfulness") ||
    name.includes("sudoku") ||
    name.includes("crossword")
  ) {
    return "Brainpower"
  }

  // Return a default category
  return "Activity"
}

// Add a function to get the task completion percentage for a user

/**
 * Get the daily task completion percentage for a user
 */
export async function getDailyTaskCompletion(
  userId: string,
): Promise<{ completed: number; total: number; percentage: number }> {
  try {
    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await supabase
      .from("user_daily_tasks")
      .select("completed")
      .eq("user_id", userId)
      .eq("assigned_date", today)

    if (error) {
      console.error("Error fetching daily task completion:", error)
      return { completed: 0, total: 0, percentage: 0 }
    }

    if (!data || data.length === 0) {
      return { completed: 0, total: 0, percentage: 0 }
    }

    const completed = data.filter((task) => task.completed).length
    const total = data.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  } catch (error) {
    console.error("Error in getDailyTaskCompletion:", error)
    return { completed: 0, total: 0, percentage: 0 }
  }
}

