import { supabase } from "./supabase"
import { calculateLevel } from "./level-system"

export interface SpecialEnemy {
  id: string
  name: string
  description: string
  image: string
  requirements: {
    [key: string]: number
  }
  stats: {
    health: number
    attack: number
    defense: number
  }
  reward: {
    type: string
    item: string
    name: string
    description: string
  }
}

export const SPECIAL_ENEMIES: SpecialEnemy[] = [
  {
    id: "ancient-warrior",
    name: "Ancient Warrior",
    description: "A legendary warrior from a forgotten age. Defeating him requires great strength and endurance.",
    image: "ancient_warrior.png",
    requirements: {
      strength: 20,
      endurance: 18,
    },
    stats: {
      health: 25000,
      attack: 800,
      defense: 600,
    },
    reward: {
      type: "hat",
      item: "ancient_helmet.png",
      name: "Ancient Helmet",
      description: "A legendary helmet worn by the mightiest warriors of old.",
    },
  },
  {
    id: "shadow-assassin",
    name: "Shadow Assassin",
    description:
      "A swift and deadly foe who moves like the wind. Only those with great agility and reactions can defeat him.",
    image: "shadow_assassin.png",
    requirements: {
      agility: 22,
      reactions: 20,
      speed: 18,
    },
    stats: {
      health: 80000,
      attack: 1000,
      defense: 400,
    },
    reward: {
      type: "hat",
      item: "shadow_cloak.png",
      name: "Shadow Cloak",
      description: "A mysterious cloak that seems to bend light around its wearer.",
    },
  },
  {
    id: "mystic-sage",
    name: "Mystic Sage",
    description: "A master of ancient knowledge and mental fortitude. Defeating him requires wisdom and flexibility.",
    image: "mystic_sage.png",
    requirements: {
      brainpower: 25,
      flexibility: 20,
    },
    stats: {
      health: 120000,
      attack: 900,
      defense: 700,
    },
    reward: {
      type: "border",
      item: "mystic_aura.png",
      name: "Mystic Aura",
      description: "A shimmering aura of arcane energy that surrounds your character.",
    },
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "A blur of motion that can only be challenged by the quickest of heroes.",
    image: "speed_demon.png",
    requirements: {
      speed: 28,
      reactions: 25,
    },
    stats: {
      health: 75000,
      attack: 1200,
      defense: 300,
    },
    reward: {
      type: "hat",
      item: "winged_cap.png",
      name: "Winged Cap",
      description: "A cap with magical wings that seems to make the wearer lighter than air.",
    },
  },
  {
    id: "iron-golem",
    name: "Iron Golem",
    description: "A massive construct of living metal. Only the strongest can hope to dent its armor.",
    image: "iron_golem.png",
    requirements: {
      strength: 30,
      endurance: 28,
    },
    stats: {
      health: 200000,
      attack: 700,
      defense: 1000,
    },
    reward: {
      type: "avatar",
      item: "iron_skin.png",
      name: "Iron Skin",
      description: "Your skin takes on a metallic sheen, making you look nearly invincible.",
    },
  },
  {
    id: "mind-flayer",
    name: "Mind Flayer",
    description: "A psychic entity that attacks the mind directly. Only those with great mental fortitude can resist.",
    image: "mind_flayer.png",
    requirements: {
      brainpower: 32,
      reactions: 25,
    },
    stats: {
      health: 150000,
      attack: 1500,
      defense: 500,
    },
    reward: {
      type: "border",
      item: "psychic_waves.png",
      name: "Psychic Waves",
      description: "Rippling waves of mental energy that emanate from your character.",
    },
  },
  {
    id: "dragon-king",
    name: "Dragon King",
    description: "The ultimate challenge. Only a well-rounded hero can hope to defeat this legendary beast.",
    image: "dragon_king.png",
    requirements: {
      strength: 30,
      endurance: 30,
      agility: 30,
      speed: 30,
      flexibility: 30,
      reactions: 30,
      brainpower: 30,
    },
    stats: {
      health: 500000,
      attack: 2000,
      defense: 1500,
    },
    reward: {
      type: "avatar",
      item: "dragon_armor.png",
      name: "Dragon Armor",
      description: "Legendary armor forged from the scales of the Dragon King himself.",
    },
  },
]

export async function canChallengeEnemy(playerData: any, enemy: SpecialEnemy): Promise<boolean> {
  // Check each required skill
  for (const [skill, requiredLevel] of Object.entries(enemy.requirements)) {
    // Get the player's XP for this skill
    const skillXp = playerData.stats[skill.toLowerCase() as keyof typeof playerData.stats] || 0

    // Calculate the player's level for this skill
    const playerLevel = calculateLevel(skillXp)

    // If the player's level is less than the required level, they can't challenge this enemy
    if (playerLevel < requiredLevel) {
      console.log(`Player level for ${skill}: ${playerLevel}, required: ${requiredLevel} - requirement not met`)
      return false
    }
  }

  // If all requirements are met, the player can challenge this enemy
  return true
}

export async function hasDefeatedEnemy(userId: string, enemyId: string): Promise<boolean> {
  try {
    // Supabase import would go here
    const { data, error } = await supabase
      .from("defeated_special_enemies")
      .select("*")
      .eq("user_id", userId)
      .eq("enemy_id", enemyId)
    if (error) {
      console.error("Error checking defeated enemy:", error)
      return false
    }
    return data !== null && data.length > 0
  } catch (error) {
    console.error("Unexpected error checking defeated enemy:", error)
    return false
  }
}

export async function recordEnemyDefeat(userId: string, enemyId: string): Promise<boolean> {
  try {
    // Supabase import would go here
    const { error } = await supabase.from("defeated_special_enemies").insert({ user_id: userId, enemy_id: enemyId })
    if (error) {
      console.error("Error recording enemy defeat:", error)
      return false
    }
    return true
  } catch (error) {
    console.error("Unexpected error recording enemy defeat:", error)
    return false
  }
}

export async function awardSpecialItem(playerId: string, enemyId: string, playerData: any): Promise<boolean> {
  const enemy = SPECIAL_ENEMIES.find((e) => e.id === enemyId)
  if (!enemy) {
    console.error("Enemy not found")
    return false
  }

  try {
    // Fetch the item ID from the special_items table
    const { data: itemData, error: itemError } = await supabase
      .from("special_items")
      .select("id")
      .eq("name", enemy.reward.name)
      .single()

    if (itemError) {
      console.error("Error fetching item ID:", itemError)
      return false
    }

    if (!itemData) {
      console.error("Item not found in special_items table")
      return false
    }

    // Insert into player_special_items table
    const { data, error } = await supabase
      .from("player_special_items")
      .insert([{ user_id: playerId, item_id: itemData.id }])

    if (error) {
      console.error("Error inserting special item record:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error awarding special item:", error)
    return false
  }
}

