import type { PlayerData } from "./player-db"
import { getPlayerDataById } from "./player-db"
import type { Friend } from "./friend-functions"

interface BattleResult {
  winner: string | null
  playerHealth: number
  friendHealth: number
  xpGained: number
  battleLog: string[]
}

interface BattleState {
  playerHealth: number
  friendHealth: number
  log: string[]
}

export async function pvpBattle(
  player: PlayerData,
  friend: Friend,
  onUpdate: (state: BattleState) => void,
): Promise<BattleResult> {
  const friendData = await getPlayerDataById(friend.id)
  if (!friendData) {
    throw new Error("Failed to fetch friend's data")
  }

  const playerAttack = calculateAttack(player.stats)
  const playerDefense = calculateDefense(player.stats)
  const friendAttack = calculateAttack(friendData.stats)
  const friendDefense = calculateDefense(friendData.stats)

  // Get speed stats to determine initiative
  const playerSpeed = player.stats.speed
  const friendSpeed = friendData.stats.speed

  let playerHealth = 100
  let friendHealth = 100
  const battleLog: string[] = []

  // Determine who goes first based on speed
  const playerGoesFirst = playerSpeed >= friendSpeed

  if (playerGoesFirst) {
    battleLog.push(`${player.username} has higher speed (${playerSpeed}) and attacks first!`)
  } else {
    battleLog.push(`${friend.username} has higher speed (${friendSpeed}) and attacks first!`)
  }

  const updateState = () => {
    onUpdate({ playerHealth, friendHealth, log: battleLog })
  }

  // Make initial state update to show who goes first
  updateState()
  await delay(500)

  let totalHits = 0
  let noDamageHits = 0

  while (totalHits < 10) {
    if (playerGoesFirst) {
      // Player attacks first
      await playerAttackTurn()
      if (friendHealth <= 0) break

      // Friend attacks second
      await friendAttackTurn()
      if (playerHealth <= 0) break
    } else {
      // Friend attacks first
      await friendAttackTurn()
      if (playerHealth <= 0) break

      // Player attacks second
      await playerAttackTurn()
      if (friendHealth <= 0) break
    }
  }

  async function playerAttackTurn() {
    await delay(500)
    const playerDamage = Math.max(0, playerAttack - friendDefense)
    friendHealth -= playerDamage
    battleLog.push(`${player.username} deals ${playerDamage} damage to ${friend.username}`)
    updateState()
    totalHits++
    if (playerDamage === 0) noDamageHits++

    // Ensure health doesn't go below 0
    friendHealth = Math.max(0, friendHealth)
  }

  async function friendAttackTurn() {
    await delay(500)
    const friendDamage = Math.max(0, friendAttack - playerDefense)
    playerHealth -= friendDamage
    battleLog.push(`${friend.username} deals ${friendDamage} damage to ${player.username}`)
    updateState()
    totalHits++
    if (friendDamage === 0) noDamageHits++

    // Ensure health doesn't go below 0
    playerHealth = Math.max(0, playerHealth)
  }

  let winner: string | null
  let xpGained: number

  if (noDamageHits === 10) {
    winner = null
    xpGained = 0
    battleLog.push("The battle ends in a draw!")
  } else if (playerHealth > friendHealth) {
    winner = player.id
    xpGained = 1
    battleLog.push(`${player.username} wins the battle!`)
  } else {
    winner = friend.id
    xpGained = 0
    battleLog.push(`${friend.username} wins the battle!`)
  }

  return {
    winner,
    playerHealth,
    friendHealth,
    xpGained,
    battleLog,
  }
}

function calculateAttack(stats: PlayerData["stats"]): number {
  return stats.strength * 2 + stats.agility + stats.speed
}

function calculateDefense(stats: PlayerData["stats"]): number {
  return stats.endurance * 2 + stats.strength + stats.flexibility
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

