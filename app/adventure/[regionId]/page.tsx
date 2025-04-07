"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Swords, Trophy, Heart, Shield } from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import { getPlayerData } from "@/lib/player-db"

interface Region {
  id: string
  name: string
  description: string
  image: string
  enemies: Array<{
    id: string
    name: string
    level: number
    health: number
    attack: number
    defense: number
    image: string
    rewards: {
      xp: number
      gold: number
      items?: Array<{
        name: string
        type: string
        rarity: string
      }>
    }
  }>
  boss: {
    id: string
    name: string
    level: number
    health: number
    attack: number
    defense: number
    image: string
    rewards: {
      xp: number
      gold: number
      items: Array<{
        name: string
        type: string
        rarity: string
      }>
    }
  }
  quests: Array<{
    id: string
    name: string
    description: string
    objectives: Array<{
      type: string
      target: string
      count: number
      progress: number
    }>
    rewards: {
      xp: number
      gold: number
      items?: Array<{
        name: string
        type: string
        rarity: string
      }>
    }
  }>
}

export default function RegionPage() {
  const router = useRouter()
  const params = useParams()
  const regionId = params.regionId as string

  const [playerData, setPlayerData] = useState<any>(null)
  const [region, setRegion] = useState<Region | null>(null)
  const [selectedEnemy, setSelectedEnemy] = useState<any | null>(null)
  const [selectedQuest, setSelectedQuest] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [battleState, setBattleState] = useState({
    inProgress: false,
    playerHealth: 100,
    enemyHealth: 100,
    log: [] as string[],
    result: null as "victory" | "defeat" | null,
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const user = await getCurrentUser()
      if (user) {
        const data = await getPlayerData(user.id)
        if (data) {
          setPlayerData(data)
        }

        // In a real app, this would come from an API based on the regionId
        // For now, we'll use mock data
        const mockRegion: Region = {
          id: regionId,
          name:
            regionId === "forest-of-beginnings"
              ? "Forest of Beginnings"
              : regionId === "crystal-caves"
                ? "Crystal Caves"
                : "Unknown Region",
          description:
            regionId === "forest-of-beginnings"
              ? "A peaceful forest where your adventure begins. Perfect for new heroes to test their skills."
              : regionId === "crystal-caves"
                ? "Mysterious caves filled with glowing crystals and challenging monsters."
                : "An unexplored region of the world.",
          image:
            regionId === "forest-of-beginnings"
              ? "/regions/forest.jpg"
              : regionId === "crystal-caves"
                ? "/regions/caves.jpg"
                : "/placeholder.svg",
          enemies: [
            {
              id: "forest-goblin",
              name: "Forest Goblin",
              level: 2,
              health: 50,
              attack: 5,
              defense: 2,
              image: "/enemies/goblin.png",
            },
          ],
          boss: {
            id: "forest-troll",
            name: "Forest Troll",
            level: 5,
            health: 150,
            attack: 10,
            defense: 5,
            image: "/enemies/troll.png",
            rewards: {
              xp: 200,
              gold: 100,
              items: [{ name: "Troll Club", type: "weapon", rarity: "common" }],
            },
          },
          quests: [
            {
              id: "goblin-hunt",
              name: "Goblin Hunt",
              description: "Eliminate the goblin threat in the forest.",
              objectives: [{ type: "kill", target: "forest-goblin", count: 5, progress: 0 }],
              rewards: { xp: 100, gold: 50 },
            },
          ],
        }

        setRegion(mockRegion)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [regionId])

  useEffect(() => {
    if (playerData) {
      // Example: Update player data (XP) after a quest is completed
      // This is just a placeholder; actual implementation would involve API calls
      // and state management.
      // setPlayerData(prevData => ({
      //   ...prevData,
      //   xp: prevData.xp + 50 // Example: Add 50 XP
      // }));
    }
  }, [playerData])

  const handleEnemySelect = (enemy: any) => {
    setSelectedEnemy(enemy)
  }

  const handleQuestSelect = (quest: any) => {
    setSelectedQuest(quest)
  }

  const startBattle = () => {
    if (playerData && selectedEnemy) {
      setBattleState({
        ...battleState,
        inProgress: true,
        playerHealth: playerData.health,
        enemyHealth: selectedEnemy.health,
        log: [],
        result: null,
      })
    }
  }

  const attackEnemy = () => {
    if (playerData && selectedEnemy) {
      const playerAttack = playerData.attack
      const enemyDefense = selectedEnemy.defense
      const damage = Math.max(0, playerAttack - enemyDefense) // Ensure damage is not negative
      const newEnemyHealth = Math.max(0, battleState.enemyHealth - damage) // Ensure health is not negative

      setBattleState((prevState) => ({
        ...prevState,
        enemyHealth: newEnemyHealth,
        log: [...prevState.log, `You attack ${selectedEnemy.name} for ${damage} damage!`],
      }))

      // Enemy attacks back (simplified)
      const enemyAttack = selectedEnemy.attack
      const playerDefense = playerData.defense
      const enemyDamage = Math.max(0, enemyAttack - playerDefense)
      const newPlayerHealth = Math.max(0, battleState.playerHealth - enemyDamage)

      setBattleState((prevState) => ({
        ...prevState,
        playerHealth: newPlayerHealth,
        log: [...prevState.log, `${selectedEnemy.name} attacks you for ${enemyDamage} damage!`],
      }))

      // Check for battle end
      if (newEnemyHealth <= 0) {
        setBattleState((prevState) => ({
          ...prevState,
          inProgress: false,
          result: "victory",
          log: [...prevState.log, `You defeated ${selectedEnemy.name}!`],
        }))
      } else if (newPlayerHealth <= 0) {
        setBattleState((prevState) => ({
          ...prevState,
          inProgress: false,
          result: "defeat",
          log: [...prevState.log, `You were defeated by ${selectedEnemy.name}!`],
        }))
      }
    }
  }

  const endBattle = () => {
    setBattleState({
      inProgress: false,
      playerHealth: 100,
      enemyHealth: 100,
      log: [],
      result: null,
    })
    setSelectedEnemy(null)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!region) {
    return <div>Region not found</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" onClick={() => router.back()}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Region Info */}
        <Card className="bg-stone-800 text-white">
          <CardContent className="p-4">
            <h2 className="text-2xl font-bold mb-2">{region.name}</h2>
            <img
              src={region.image || "/placeholder.svg"}
              alt={region.name}
              className="w-full h-48 object-cover rounded-md mb-2"
            />
            <p className="text-sm">{region.description}</p>
          </CardContent>
        </Card>

        {/* Player Info */}
        {playerData && (
          <Card className="bg-stone-800 text-white">
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold mb-2">Player Info</h3>
              <p>Name: {playerData.name}</p>
              <p>Level: {playerData.level}</p>
              <p>Class: {playerData.class}</p>
              <Progress value={playerData.xp} max={100} className="mb-2" />
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Health: {playerData.health}</span>
                <Swords className="h-4 w-4 text-yellow-500" />
                <span>Attack: {playerData.attack}</span>
                <Shield className="h-4 w-4 text-blue-500" />
                <span>Defense: {playerData.defense}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {/* Enemies */}
        <Card className="bg-stone-700 text-white">
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-2">Enemies</h3>
            <ul>
              {region.enemies.map((enemy) => (
                <li
                  key={enemy.id}
                  className="mb-2 p-2 rounded-md hover:bg-stone-600 cursor-pointer"
                  onClick={() => handleEnemySelect(enemy)}
                >
                  <div className="flex items-center space-x-2">
                    <img src={enemy.image || "/placeholder.svg"} alt={enemy.name} className="w-8 h-8 rounded-full" />
                    <span>
                      {enemy.name} (Level {enemy.level})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Quests */}
        <Card className="bg-stone-700 text-white">
          <CardContent className="p-4">
            <h3 className="text-xl font-semibold mb-2">Quests</h3>
            <ul>
              {region.quests.map((quest) => (
                <li
                  key={quest.id}
                  className="mb-2 p-2 rounded-md hover:bg-stone-600 cursor-pointer"
                  onClick={() => handleQuestSelect(quest)}
                >
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>{quest.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Selected Enemy/Quest Details */}
        <Card className="bg-stone-700 text-white">
          <CardContent className="p-4">
            {selectedEnemy ? (
              <>
                <h3 className="text-xl font-semibold mb-2">{selectedEnemy.name} Details</h3>
                <img
                  src={selectedEnemy.image || "/placeholder.svg"}
                  alt={selectedEnemy.name}
                  className="w-full h-32 object-cover rounded-md mb-2"
                />
                <p>Level: {selectedEnemy.level}</p>
                <p>Health: {selectedEnemy.health}</p>
                <p>Attack: {selectedEnemy.attack}</p>
                <p>Defense: {selectedEnemy.defense}</p>
                {!battleState.inProgress && <Button onClick={startBattle}>Start Battle</Button>}
              </>
            ) : selectedQuest ? (
              <>
                <h3 className="text-xl font-semibold mb-2">{selectedQuest.name} Details</h3>
                <p>{selectedQuest.description}</p>
                <ul>
                  {selectedQuest.objectives.map((objective, index) => (
                    <li key={index}>
                      {objective.type}: {objective.target} ({objective.progress}/{objective.count})
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>Select an enemy or quest to view details.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Battle Section */}
      {battleState.inProgress && selectedEnemy && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold mb-2 text-white">Battle vs {selectedEnemy.name}</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Player Health */}
            <Card className="bg-stone-800 text-white">
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">Your Health</h3>
                <Progress value={battleState.playerHealth} max={playerData.health} />
                <p>
                  Health: {battleState.playerHealth} / {playerData.health}
                </p>
              </CardContent>
            </Card>

            {/* Enemy Health */}
            <Card className="bg-stone-800 text-white">
              <CardContent className="p-4">
                <h3 className="text-xl font-semibold mb-2">{selectedEnemy.name}'s Health</h3>
                <Progress value={battleState.enemyHealth} max={selectedEnemy.health} />
                <p>
                  Health: {battleState.enemyHealth} / {selectedEnemy.health}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Battle Log */}
          <Card className="bg-stone-700 text-white mt-4">
            <CardContent className="p-4">
              <h3 className="text-xl font-semibold mb-2">Battle Log</h3>
              <ul>
                {battleState.log.map((log, index) => (
                  <li key={index} className="text-sm">
                    {log}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Battle Actions */}
          <div className="mt-4">
            <Button onClick={attackEnemy} disabled={battleState.result !== null}>
              Attack
            </Button>
            {battleState.result && (
              <div className="mt-2">
                {battleState.result === "victory" ? (
                  <p className="text-green-500">You Won!</p>
                ) : (
                  <p className="text-red-500">You Lost!</p>
                )}
                <Button onClick={endBattle}>End Battle</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

