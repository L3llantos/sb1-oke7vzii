"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ChevronLeft, Dumbbell, Brain, Zap, Flame, Activity, Search } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { logActivity, getActivityDefinitions, type ActivityDefinition } from "@/lib/activity-db"
import { getCurrentUser } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { RefreshProvider, useRefreshContext } from "@/lib/refresh-context"

// Create a separate component that uses the refresh context
function LogActivityContent() {
  const [activities, setActivities] = useState<ActivityDefinition[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityDefinition[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ActivityDefinition | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [intensity, setIntensity] = useState(5)
  const [xpGain, setXpGain] = useState<Array<{ skill: string; value: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("Strength")
  const router = useRouter()

  // Import the useRefreshContext hook inside the component that's wrapped with RefreshProvider
  const { triggerRefresh } = useRefreshContext()

  useEffect(() => {
    fetchActivities()
  }, [])

  useEffect(() => {
    if (selectedActivity) {
      calculateXP()
    }
  }, [selectedActivity, duration, intensity])

  useEffect(() => {
    if (activities.length > 0) {
      filterActivities()
    }
  }, [searchQuery, activeCategory, activities])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const activityData = await getActivityDefinitions()
      setActivities(activityData)
      setFilteredActivities(activityData.filter((activity) => activity.category === activeCategory))
    } catch (error) {
      console.error("Error fetching activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    // Filter by search query if it exists
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (activity) => activity.name.toLowerCase().includes(query) || activity.category.toLowerCase().includes(query),
      )
    }
    // Otherwise filter by active category
    else if (activeCategory !== "All") {
      filtered = filtered.filter((activity) => activity.category === activeCategory)
    }

    setFilteredActivities(filtered)
  }

  const calculateXP = () => {
    if (!selectedActivity || duration === null) return

    const multiplier = duration * (intensity / 5)
    const newXpGain = [
      { skill: "Strength", value: Math.max(1, Math.round(selectedActivity.strength_xp * multiplier)) },
      { skill: "Endurance", value: Math.max(1, Math.round(selectedActivity.endurance_xp * multiplier)) },
      { skill: "Agility", value: Math.max(1, Math.round(selectedActivity.agility_xp * multiplier)) },
      { skill: "Flexibility", value: Math.max(1, Math.round(selectedActivity.flexibility_xp * multiplier)) },
      { skill: "Speed", value: Math.max(1, Math.round(selectedActivity.speed_xp * multiplier)) },
      { skill: "Reactions", value: Math.max(1, Math.round(selectedActivity.reactions_xp * multiplier)) },
      { skill: "Brainpower", value: Math.max(1, Math.round(selectedActivity.brainpower_xp * multiplier)) },
    ]

    setXpGain(newXpGain)
  }

  const handleSaveActivity = async () => {
    if (!selectedActivity) return
    if (duration === null || duration < 1 || duration > 720) {
      // Show error or alert
      alert("Please enter a valid duration between 1 and 720 minutes")
      return
    }

    const user = await getCurrentUser()
    if (!user) {
      console.error("No user found")
      return
    }

    const success = await logActivity(user.id, {
      name: selectedActivity.name,
      activity_id: selectedActivity.id,
      duration,
      intensity,
      xp_gained: Object.fromEntries(xpGain.map((xp) => [xp.skill.toLowerCase(), xp.value])),
    })

    if (success) {
      triggerRefresh() // Trigger refresh after successful activity logging
      router.push("/")
    } else {
      console.error("Failed to log activity")
    }
  }

  const activityCategories = [
    { name: "All", icon: Activity, color: "text-white", bgColor: "bg-white/20" },
    { name: "Strength", icon: Dumbbell, color: "text-red-400", bgColor: "bg-red-500/20" },
    { name: "Cardio", icon: Flame, color: "text-orange-400", bgColor: "bg-orange-500/20" },
    { name: "Flexibility", icon: Activity, color: "text-green-400", bgColor: "bg-green-500/20" },
    { name: "Sports", icon: Zap, color: "text-yellow-400", bgColor: "bg-yellow-500/20" },
    { name: "Mind", icon: Brain, color: "text-indigo-400", bgColor: "bg-indigo-500/20" },
  ]

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setSearchQuery("") // Clear search when changing category
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container px-4 py-6 mx-auto max-w-md">
        <header className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Log Activity</h1>
        </header>

        <Card className="border-0 bg-white/10 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
              <Input
                placeholder="Search activities..."
                className="pl-10 bg-white/10 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <p>Loading activities...</p>
              </div>
            ) : (
              <Tabs defaultValue="Strength" className="w-full" onValueChange={handleCategoryChange}>
                <TabsList className="w-full mb-4 bg-white/5">
                  {activityCategories.map((category) => (
                    <TabsTrigger
                      key={category.name}
                      value={category.name}
                      className="flex-1 data-[state=active]:bg-white/10"
                    >
                      <category.icon className={`w-4 h-4 mr-1 ${category.color}`} />
                      <span className="sr-only sm:not-sr-only sm:text-xs">{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="mt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {filteredActivities.map((activity) => {
                      const categoryInfo =
                        activityCategories.find(
                          (cat) =>
                            cat.name === activity.category || (cat.name === "Cardio" && activity.category === "Cardio"),
                        ) || activityCategories[0]

                      return (
                        <Button
                          key={activity.id}
                          variant="outline"
                          className={`justify-start h-auto p-3 border-white/10 hover:bg-white/10 ${
                            selectedActivity?.id === activity.id ? "bg-white/20" : "bg-white/5"
                          }`}
                          onClick={() => setSelectedActivity(activity)}
                        >
                          <div className={`mr-2 p-1.5 rounded-full ${categoryInfo.bgColor}`}>
                            <categoryInfo.icon className={`w-3.5 h-3.5 ${categoryInfo.color}`} />
                          </div>
                          <span className="text-sm">{activity.name}</span>
                        </Button>
                      )
                    })}
                  </div>

                  {filteredActivities.length === 0 && (
                    <div className="text-center py-8 text-white/70">
                      {searchQuery
                        ? `No activities found matching "${searchQuery}"`
                        : `No activities found in ${activeCategory} category`}
                    </div>
                  )}
                </div>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              {selectedActivity && (
                <div className="p-3 rounded-lg bg-white/5 mb-4">
                  <h3 className="font-medium">Selected: {selectedActivity.name}</h3>
                  <p className="text-xs text-white/70">Category: {selectedActivity.category}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={720}
                    placeholder="Enter duration"
                    value={duration === null ? "" : duration}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : Number(e.target.value)
                      setDuration(value)
                    }}
                    className="bg-white/10 border-white/20"
                  />
                  <span className="w-12 text-center">min</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="intensity">Intensity (1-10)</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="intensity"
                    min={1}
                    max={10}
                    step={1}
                    value={[intensity]}
                    onValueChange={(value) => setIntensity(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">{intensity}</span>
                </div>
              </div>

              {selectedActivity && (
                <div className="p-3 mt-6 rounded-lg bg-white/5">
                  <h3 className="mb-2 text-sm font-medium">Estimated XP Gain:</h3>
                  <div className="flex flex-wrap gap-2">
                    {xpGain
                      .filter((xp) => xp.value > 0)
                      .map((xp) => (
                        <div key={xp.skill} className="px-2 py-1 text-xs rounded-full bg-white/10">
                          +{xp.value} {xp.skill}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="fixed inset-x-0 bottom-0 p-4 bg-slate-900/80 backdrop-blur-md">
          <Button
            onClick={handleSaveActivity}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            disabled={!selectedActivity || duration === null || duration < 1 || duration > 720}
          >
            {selectedActivity
              ? duration === null || duration < 1 || duration > 720
                ? "Enter valid duration (1-720 min)"
                : "Save Activity"
              : "Select an Activity"}
          </Button>
        </div>
      </div>
    </main>
  )
}

// Main component that wraps the content with RefreshProvider
export default function LogActivity() {
  return (
    <RefreshProvider>
      <LogActivityContent />
    </RefreshProvider>
  )
}

