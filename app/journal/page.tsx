"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, BookHeart, Plus, Calendar, Search, Tag, Smile, Frown, Meh, ThumbsUp, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { getCurrentUser } from "@/lib/supabase"
import { getPlayerData } from "@/lib/player-db"

interface JournalEntry {
  id: string
  date: string
  title: string
  content: string
  mood: "happy" | "neutral" | "sad"
  tags: string[]
  xpEarned: number
}

export default function JournalPage() {
  const [playerData, setPlayerData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("entries")
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string | null>(null)
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null)
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
        const mockEntries: JournalEntry[] = [
          {
            id: "entry-1",
            date: "2023-06-15",
            title: "Morning Workout Reflection",
            content:
              "Today I pushed myself harder than usual during my morning workout. I increased the weights for my squats and managed to do 5 more push-ups than last time. I'm feeling stronger and more confident in my abilities. The endorphin rush afterward was amazing!",
            mood: "happy",
            tags: ["workout", "progress", "strength"],
            xpEarned: 50,
          },
          {
            id: "entry-2",
            date: "2023-06-14",
            title: "Nutrition Challenges",
            content:
              "I struggled with my nutrition today. Had cravings for sweets and ended up having a cookie after lunch. I need to prepare better snacks for work to avoid these situations. Tomorrow I'll pack some fruit and yogurt.",
            mood: "neutral",
            tags: ["nutrition", "challenges"],
            xpEarned: 30,
          },
          {
            id: "entry-3",
            date: "2023-06-12",
            title: "Rest Day Reflections",
            content:
              "Taking a rest day today. My body feels tired from the intense workouts this week. I'm learning to listen to my body and understand that rest is just as important as exercise for progress. Used the time to stretch and do some light yoga instead.",
            mood: "happy",
            tags: ["rest", "recovery", "yoga"],
            xpEarned: 40,
          },
          {
            id: "entry-4",
            date: "2023-06-10",
            title: "Feeling Unmotivated",
            content:
              "Didn't feel like working out today. The rainy weather and lack of sleep made it hard to get motivated. I only did a short 15-minute session instead of my planned routine. Need to find strategies for these low-energy days.",
            mood: "sad",
            tags: ["motivation", "challenges"],
            xpEarned: 20,
          },
          {
            id: "entry-5",
            date: "2023-06-08",
            title: "New Personal Record!",
            content:
              "Hit a new PR on my 5k run today! Finished in 23:45, which is almost a minute faster than my previous best. All the interval training is paying off. Feeling incredibly proud and motivated to keep pushing my limits.",
            mood: "happy",
            tags: ["running", "achievement", "cardio"],
            xpEarned: 60,
          },
        ]

        setEntries(mockEntries)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [])

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case "happy":
        return <Smile className="w-5 h-5 text-green-400" />
      case "neutral":
        return <Meh className="w-5 h-5 text-yellow-400" />
      case "sad":
        return <Frown className="w-5 h-5 text-red-400" />
      default:
        return <Meh className="w-5 h-5 text-yellow-400" />
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Filter entries based on search query, mood filter, and tag filter
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesMood = selectedMoodFilter ? entry.mood === selectedMoodFilter : true
    const matchesTag = selectedTagFilter ? entry.tags.includes(selectedTagFilter) : true

    return matchesSearch && matchesMood && matchesTag
  })

  // Get all unique tags from entries
  const allTags = [...new Set(entries.flatMap((entry) => entry.tags))]

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
        <div className="container px-4 py-6 mx-auto max-w-md">
          <div className="flex items-center justify-center h-screen">
            <p>Loading journal entries...</p>
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
          <h1 className="text-xl font-bold">Journal</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-pink-500/20 rounded-full text-pink-300">
              <BookHeart className="w-3 h-3" />
              <span>+10 XP</span>
            </div>
          </div>
        </header>

        <Card className="mb-6 border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Reflection Journal</h2>
              <Link href="/journal/new">
                <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Entry
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-pink-300" />
                <span>{entries.length} entries</span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4 text-pink-300" />
                <span>{entries.reduce((total, entry) => total + entry.xpEarned, 0)} XP earned</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="entries" className="data-[state=active]:bg-pink-600">
              <BookHeart className="w-4 h-4 mr-2" />
              Entries
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-pink-600">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-2">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Search entries..."
                    className="pl-10 bg-white/10 border-white/10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {filteredEntries.length > 0 ? (
                    filteredEntries.map((entry) => (
                      <Link key={entry.id} href={`/journal/${entry.id}`}>
                        <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium">{entry.title}</h3>
                            {getMoodIcon(entry.mood)}
                          </div>
                          <p className="text-xs text-white/70 line-clamp-2 mb-2">{entry.content}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {entry.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70"
                                >
                                  #{tag}
                                </span>
                              ))}
                              {entry.tags.length > 2 && (
                                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                                  +{entry.tags.length - 2}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-white/50">{formatDate(entry.date)}</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-white/70">
                      <BookHeart className="w-12 h-12 mx-auto mb-2 text-white/30" />
                      <p>No journal entries found</p>
                      <p className="text-sm mt-2">
                        {searchQuery || selectedMoodFilter || selectedTagFilter
                          ? "Try adjusting your filters"
                          : "Start writing to track your fitness journey"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-2">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Filter Entries</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">By Mood</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${selectedMoodFilter === "happy" ? "bg-green-500/20 border-green-500/50" : ""}`}
                        onClick={() => setSelectedMoodFilter(selectedMoodFilter === "happy" ? null : "happy")}
                      >
                        <Smile className="w-4 h-4 mr-2 text-green-400" />
                        Happy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${selectedMoodFilter === "neutral" ? "bg-yellow-500/20 border-yellow-500/50" : ""}`}
                        onClick={() => setSelectedMoodFilter(selectedMoodFilter === "neutral" ? null : "neutral")}
                      >
                        <Meh className="w-4 h-4 mr-2 text-yellow-400" />
                        Neutral
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex-1 ${selectedMoodFilter === "sad" ? "bg-red-500/20 border-red-500/50" : ""}`}
                        onClick={() => setSelectedMoodFilter(selectedMoodFilter === "sad" ? null : "sad")}
                      >
                        <Frown className="w-4 h-4 mr-2 text-red-400" />
                        Sad
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">By Tag</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className={`${selectedTagFilter === tag ? "bg-pink-500/20 border-pink-500/50" : ""}`}
                          onClick={() => setSelectedTagFilter(selectedTagFilter === tag ? null : tag)}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {(selectedMoodFilter || selectedTagFilter) && (
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => {
                        setSelectedMoodFilter(null)
                        setSelectedTagFilter(null)
                      }}
                    >
                      Clear All Filters
                    </Button>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Journal Stats</h3>
                  <div className="space-y-2">
                    <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-sm">Total Entries</span>
                      <span className="text-sm font-medium">{entries.length}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-sm">Happy Entries</span>
                      <span className="text-sm font-medium">{entries.filter((e) => e.mood === "happy").length}</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-sm">Most Used Tag</span>
                      <span className="text-sm font-medium">
                        {allTags.length > 0
                          ? allTags.sort((a, b) => {
                              const countA = entries.filter((e) => e.tags.includes(a)).length
                              const countB = entries.filter((e) => e.tags.includes(b)).length
                              return countB - countA
                            })[0]
                          : "None"}
                      </span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                      <span className="text-sm">Total XP Earned</span>
                      <span className="text-sm font-medium">
                        {entries.reduce((total, entry) => total + entry.xpEarned, 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

