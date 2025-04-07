"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Plus, Search, Utensils, Apple, Coffee, Pizza, Salad, Flame, BarChart } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getCurrentUser } from "@/lib/supabase"
import { getPlayerData } from "@/lib/player-db"

interface NutritionData {
  calories: {
    goal: number
    current: number
  }
  macros: {
    protein: { goal: number; current: number }
    carbs: { goal: number; current: number }
    fat: { goal: number; current: number }
  }
  meals: Array<{
    id: string
    name: string
    time: string
    calories: number
    protein: number
    carbs: number
    fat: number
    items: Array<{
      name: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }>
  }>
  recipes: Array<{
    id: string
    name: string
    description: string
    calories: number
    protein: number
    carbs: number
    fat: number
    ingredients: string[]
    instructions: string[]
    image?: string
    tags: string[]
  }>
}

export default function NutritionPage() {
  const [playerData, setPlayerData] = useState<any>(null)
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [activeTab, setActiveTab] = useState("tracker")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const user = await getCurrentUser()
      if (user) {
        const data = await getPlayerData(user.id)
        if (data) {
          setPlayerData(data)
        }

        // In a real app, this would come from an API
        // For now, we'll use mock data
        const mockNutritionData: NutritionData = {
          calories: {
            goal: 2000,
            current: 1250,
          },
          macros: {
            protein: { goal: 150, current: 85 },
            carbs: { goal: 200, current: 140 },
            fat: { goal: 65, current: 40 },
          },
          meals: [
            {
              id: "breakfast",
              name: "Breakfast",
              time: "7:30 AM",
              calories: 450,
              protein: 25,
              carbs: 50,
              fat: 15,
              items: [
                { name: "Oatmeal with berries", calories: 250, protein: 10, carbs: 40, fat: 5 },
                { name: "Greek yogurt", calories: 120, protein: 15, carbs: 5, fat: 3 },
                { name: "Coffee with milk", calories: 80, protein: 0, carbs: 5, fat: 7 },
              ],
            },
            {
              id: "lunch",
              name: "Lunch",
              time: "12:30 PM",
              calories: 550,
              protein: 35,
              carbs: 60,
              fat: 20,
              items: [
                { name: "Chicken salad", calories: 350, protein: 30, carbs: 15, fat: 15 },
                { name: "Whole grain bread", calories: 120, protein: 5, carbs: 25, fat: 2 },
                { name: "Apple", calories: 80, protein: 0, carbs: 20, fat: 0 },
              ],
            },
            {
              id: "snack",
              name: "Snack",
              time: "3:30 PM",
              calories: 250,
              protein: 15,
              carbs: 30,
              fat: 5,
              items: [
                { name: "Protein bar", calories: 180, protein: 15, carbs: 20, fat: 5 },
                { name: "Banana", calories: 70, protein: 0, carbs: 10, fat: 0 },
              ],
            },
          ],
          recipes: [
            {
              id: "protein-pancakes",
              name: "Protein Pancakes",
              description: "Delicious high-protein pancakes perfect for a post-workout breakfast",
              calories: 350,
              protein: 30,
              carbs: 35,
              fat: 10,
              ingredients: [
                "1 scoop protein powder",
                "1 banana",
                "2 eggs",
                "1/4 cup oats",
                "1 tsp baking powder",
                "Cinnamon to taste",
              ],
              instructions: [
                "Blend all ingredients until smooth",
                "Heat a non-stick pan over medium heat",
                "Pour small amounts of batter to form pancakes",
                "Cook until bubbles form, then flip",
                "Serve with berries or a small amount of maple syrup",
              ],
              image: "/recipes/protein-pancakes.jpg",
              tags: ["high-protein", "breakfast", "post-workout"],
            },
            {
              id: "chicken-stir-fry",
              name: "Healthy Chicken Stir Fry",
              description: "Quick and nutritious stir fry loaded with vegetables and lean protein",
              calories: 420,
              protein: 35,
              carbs: 40,
              fat: 12,
              ingredients: [
                "8 oz chicken breast, sliced",
                "2 cups mixed vegetables (bell peppers, broccoli, carrots)",
                "2 cloves garlic, minced",
                "1 tbsp low-sodium soy sauce",
                "1 tbsp olive oil",
                "1 tsp ginger, grated",
                "1/2 cup brown rice, cooked",
              ],
              instructions: [
                "Cook brown rice according to package instructions",
                "Heat oil in a wok or large pan over medium-high heat",
                "Add chicken and cook until no longer pink",
                "Add garlic and ginger, stir for 30 seconds",
                "Add vegetables and stir-fry until tender-crisp",
                "Add soy sauce and stir to combine",
                "Serve over brown rice",
              ],
              image: "/recipes/chicken-stir-fry.jpg",
              tags: ["dinner", "high-protein", "low-fat"],
            },
            {
              id: "greek-yogurt-parfait",
              name: "Greek Yogurt Parfait",
              description: "Simple, protein-rich snack that can be prepared in advance",
              calories: 280,
              protein: 20,
              carbs: 30,
              fat: 8,
              ingredients: [
                "1 cup Greek yogurt",
                "1/4 cup granola",
                "1/2 cup mixed berries",
                "1 tbsp honey",
                "1 tbsp chia seeds",
              ],
              instructions: [
                "Layer half the yogurt in a glass or container",
                "Add half the berries and granola",
                "Repeat with remaining yogurt and berries",
                "Top with granola, chia seeds, and a drizzle of honey",
                "Enjoy immediately or refrigerate for later",
              ],
              image: "/recipes/yogurt-parfait.jpg",
              tags: ["snack", "breakfast", "high-protein", "quick"],
            },
          ],
        }

        setNutritionData(mockNutritionData)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const filteredRecipes =
    nutritionData?.recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    ) || []

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
        <div className="container px-4 py-6 mx-auto max-w-md">
          <div className="flex items-center justify-center h-screen">
            <p>Loading nutrition data...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-10"></div>
      </div>
      <div className="container px-4 py-6 mx-auto max-w-md relative z-10">
        <header className="flex items-center justify-between mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Nutrition</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-500/20 rounded-full text-orange-300">
              <Utensils className="w-3 h-3" />
              <span>+10 XP</span>
            </div>
          </div>
        </header>

        {nutritionData && (
          <Card className="mb-6 border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold">Today's Summary</h2>
                <div className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-full text-orange-300">
                  {Math.round((nutritionData.calories.current / nutritionData.calories.goal) * 100)}% of goal
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-400" />
                      Calories
                    </span>
                    <span>
                      {nutritionData.calories.current} / {nutritionData.calories.goal} kcal
                    </span>
                  </div>
                  <Progress
                    value={(nutritionData.calories.current / nutritionData.calories.goal) * 100}
                    className="h-1.5"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-center mb-1">Protein</div>
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-300">
                          {Math.round((nutritionData.macros.protein.current / nutritionData.macros.protein.goal) * 100)}
                          %
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-center mt-1">{nutritionData.macros.protein.current}g</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-center mb-1">Carbs</div>
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-green-300">
                          {Math.round((nutritionData.macros.carbs.current / nutritionData.macros.carbs.goal) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-center mt-1">{nutritionData.macros.carbs.current}g</div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="text-xs text-center mb-1">Fat</div>
                    <div className="flex justify-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-yellow-300">
                          {Math.round((nutritionData.macros.fat.current / nutritionData.macros.fat.goal) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-center mt-1">{nutritionData.macros.fat.current}g</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="tracker" className="data-[state=active]:bg-orange-600">
              <Utensils className="w-4 h-4 mr-2" />
              Food Tracker
            </TabsTrigger>
            <TabsTrigger value="recipes" className="data-[state=active]:bg-orange-600">
              <BarChart className="w-4 h-4 mr-2" />
              Recipes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="mt-2">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Today's Meals</h2>
                  <Link href="/nutrition/log">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Food
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {nutritionData?.meals.map((meal) => (
                    <div key={meal.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          {meal.name === "Breakfast" && <Coffee className="w-4 h-4 text-orange-300" />}
                          {meal.name === "Lunch" && <Utensils className="w-4 h-4 text-green-300" />}
                          {meal.name === "Snack" && <Apple className="w-4 h-4 text-red-300" />}
                          {meal.name === "Dinner" && <Pizza className="w-4 h-4 text-yellow-300" />}
                          <h3 className="text-sm font-medium">{meal.name}</h3>
                        </div>
                        <span className="text-xs text-white/70">{meal.time}</span>
                      </div>

                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-white/70">Total</span>
                        <span>{meal.calories} kcal</span>
                      </div>

                      <div className="space-y-2">
                        {meal.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs bg-white/5 p-2 rounded">
                            <span>{item.name}</span>
                            <span>{item.calories} kcal</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-end mt-2">
                        <Link href={`/nutrition/meal/${meal.id}`}>
                          <Button variant="ghost" size="sm" className="text-xs h-7">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="mt-2">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Healthy Recipes</h2>
                  <Link href="/nutrition/recipes/create">
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      New
                    </Button>
                  </Link>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Search recipes..."
                    className="pl-10 bg-white/10 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {filteredRecipes.length > 0 ? (
                    filteredRecipes.map((recipe) => (
                      <Link key={recipe.id} href={`/nutrition/recipes/${recipe.id}`}>
                        <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                          <div className="flex gap-3">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10">
                              <img
                                src={recipe.image || "/placeholder.svg?height=80&width=80"}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-medium">{recipe.name}</h3>
                              <p className="text-xs text-white/70 line-clamp-2">{recipe.description}</p>

                              <div className="flex gap-2 mt-2">
                                <div className="text-xs bg-orange-500/20 px-2 py-0.5 rounded-full text-orange-300">
                                  {recipe.calories} kcal
                                </div>
                                <div className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300">
                                  {recipe.protein}g protein
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-2">
                            {recipe.tags.map((tag, index) => (
                              <span key={index} className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-white/70">
                      <Salad className="w-12 h-12 mx-auto mb-2 text-white/30" />
                      <p>No recipes found matching "{searchQuery}"</p>
                      <p className="text-sm mt-2">Try a different search term or browse all recipes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

