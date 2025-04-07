export type Monster = {
  name: string
  health: number
  attack: number
  defense: number
  isBoss: boolean
  icon: string
}

const monsterTypes = [
  {
    name: "Goblin",
    icon: "game_assets/goblin.png", // Updated path
  },
  {
    name: "Skeleton",
    icon: "game_assets/skeleton.png", // Updated path
  },
  {
    name: "Orc",
    icon: "game_assets/orc.png", // Added new monster
  },
  {
    name: "Slime",
    icon: "game_assets/slime.png", // Added new monster
  },
  {
    name: "Ghost",
    icon: "game_assets/ghost.png", // Added new monster
  },
]

export function createMonster(wave: number): Monster {
  const baseStats = Math.floor(wave / 5) + 1
  const monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)]

  return {
    name: monsterType.name,
    health: 100 + baseStats * 10,
    attack: 10 + baseStats * 2,
    defense: 5 + baseStats,
    isBoss: false,
    icon: monsterType.icon,
  }
}

export function createBoss(wave: number): Monster {
  const baseStats = Math.floor(wave / 5) + 5
  const monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)]

  return {
    name: `Boss ${monsterType.name}`,
    health: 200 + baseStats * 20,
    attack: 20 + baseStats * 3,
    defense: 10 + baseStats * 2,
    isBoss: true,
    icon: monsterType.icon.replace(".png", "_boss.png"), // Boss variants have _boss suffix
  }
}

