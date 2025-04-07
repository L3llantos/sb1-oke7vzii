import type { Monster } from "./monster"

interface BattleStats {
  attack: number
  defense: number
}

export function battle(playerStats: BattleStats, monster: Monster, playerHealth: number, monsterHealth: number) {
  const playerAttack = Math.max(1, playerStats.attack - monster.defense)
  const monsterAttack = Math.max(1, monster.attack - playerStats.defense)

  const newPlayerHealth = Math.max(0, playerHealth - monsterAttack)
  const newMonsterHealth = Math.max(0, monsterHealth - playerAttack)

  return {
    playerHealth: Math.round(newPlayerHealth),
    monsterHealth: Math.round(newMonsterHealth),
    playerDamageDealt: playerAttack,
    monsterDamageDealt: monsterAttack,
  }
}

