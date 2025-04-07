import { supabase } from "./supabase"

export interface Quest {
  id: string
  name: string
  description: string
  xp_reward: Record<string, number>
  icon: string
}

export interface UserQuest {
  quest_id: string
  completed_at: string
}

export async function getDailyQuests(userId: string): Promise<Quest[]> {
  const { data: quests, error: questsError } = await supabase.from("quests").select("*")

  if (questsError) {
    console.error("Error fetching quests:", questsError)
    return []
  }

  const { data: userQuests, error: userQuestsError } = await supabase
    .from("user_quests")
    .select("quest_id, completed_at")
    .eq("user_id", userId)

  if (userQuestsError) {
    console.error("Error fetching user quests:", userQuestsError)
    return []
  }

  const completedQuestIds = new Set(userQuests?.map((uq) => uq.quest_id))

  return quests.map((quest) => ({
    ...quest,
    completed: completedQuestIds.has(quest.id),
    icon: quest.icon || "Activity", // Provide a default icon if none is set
  }))
}

export async function completeQuest(userId: string, questId: string): Promise<boolean> {
  const { error } = await supabase.from("user_quests").insert({ user_id: userId, quest_id: questId })

  if (error) {
    console.error("Error completing quest:", error)
    return false
  }

  return true
}

