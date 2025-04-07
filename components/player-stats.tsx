"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dumbbell,
  Brain,
  Zap,
  Flame,
  Footprints,
  Activity,
  Timer,
  Users,
  Search,
  UserPlus,
  UserMinus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculateLevel, calculateLevelProgress, getLevelDescription } from "@/lib/level-system"
import {
  searchUsersByUsername,
  sendFriendRequest,
  getPendingFriendRequests,
  respondToFriendRequest,
  getFriends,
  type Friend,
} from "@/lib/friend-functions"

import { useRefreshContext } from "@/lib/refresh-context"

interface PlayerStatsProps {
  stats: {
    strength: number
    agility: number
    endurance: number
    speed: number
    flexibility: number
    reactions: number
    brainpower: number
  }
  initialFriends?: Friend[]
  userId: string | undefined
  userEmail: string | undefined
  playerData?: any
  equippedAvatarUrl?: string | null
  equippedHatUrl?: string | null
  equippedBorderUrl?: string | null
}

export default function PlayerStats({
  stats,
  initialFriends = [],
  userId,
  userEmail,
  playerData,
  equippedAvatarUrl,
  equippedHatUrl,
  equippedBorderUrl,
}: PlayerStatsProps) {
  const [activeTab, setActiveTab] = useState("stats")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Friend[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [friends, setFriends] = useState<Friend[]>(initialFriends)
  const { refreshTrigger, triggerRefresh } = useRefreshContext()
  const [currentStats, setCurrentStats] = useState(stats)
  const [levelDescription, setLevelDescription] = useState<string>("")

  useEffect(() => {
    setCurrentStats(stats)
  }, [stats, refreshTrigger])

  useEffect(() => {
    if (userId) {
      fetchPendingRequests()
      fetchFriends()
    }
  }, [userId])

  useEffect(() => {
    async function fetchLevelDescription() {
      if (playerData) {
        try {
          const description = await getLevelDescription(playerData.level)
          setLevelDescription(description)
        } catch (error) {
          console.error("Error fetching level description:", error)
          setLevelDescription("Fitness Adventurer") // Fallback
        }
      }
    }

    fetchLevelDescription()
  }, [playerData])

  const fetchPendingRequests = async () => {
    if (!userId) return
    try {
      const requests = await getPendingFriendRequests(userId)
      setPendingRequests(requests)
      setError(null)
    } catch (error) {
      console.error("Error fetching pending requests:", error)
      setError("Failed to load friend requests. Please try again later.")
      setPendingRequests([])
    }
  }

  const fetchFriends = async () => {
    if (!userId) return
    try {
      const fetchedFriends = await getFriends(userId)
      setFriends(fetchedFriends)
    } catch (error) {
      console.error("Error fetching friends:", error)
      setError("Failed to load friends. Please try again later.")
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !userId) return

    setIsSearching(true)
    try {
      const results = await searchUsersByUsername(searchQuery, userId)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching for users:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddFriend = async (friendId: string) => {
    if (!userId) return
    try {
      const success = await sendFriendRequest(userId, friendId)
      if (success) {
        setSearchResults((prev) => prev.filter((user) => user.id !== friendId))
        console.log("Friend request sent successfully")
      } else {
        console.log("Failed to send friend request")
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
    }
  }

  const handleRespondToRequest = async (requestId: string, response: "accepted" | "rejected") => {
    try {
      const success = await respondToFriendRequest(requestId, response)
      if (success) {
        await fetchPendingRequests()
        if (response === "accepted") {
          await fetchFriends()
        }
        console.log(`Friend request ${response} successfully`)
      } else {
        setError(`Failed to ${response} friend request. Please try again.`)
      }
    } catch (error) {
      console.error("Error responding to friend request:", error)
      setError(`An error occurred while ${response === "accepted" ? "accepting" : "rejecting"} the friend request.`)
    }
  }

  const statsConfig = [
    { name: "Strength", value: currentStats.strength, icon: Dumbbell, color: "bg-red-500", textColor: "text-red-400" },
    { name: "Agility", value: currentStats.agility, icon: Zap, color: "bg-yellow-500", textColor: "text-yellow-400" },
    {
      name: "Endurance",
      value: currentStats.endurance,
      icon: Flame,
      color: "bg-orange-500",
      textColor: "text-orange-400",
    },
    { name: "Speed", value: currentStats.speed, icon: Footprints, color: "bg-blue-500", textColor: "text-blue-400" },
    {
      name: "Flexibility",
      value: currentStats.flexibility,
      icon: Activity,
      color: "bg-green-500",
      textColor: "text-green-400",
    },
    {
      name: "Reactions",
      value: currentStats.reactions,
      icon: Timer,
      color: "bg-purple-500",
      textColor: "text-purple-400",
    },
    {
      name: "Brainpower",
      value: currentStats.brainpower,
      icon: Brain,
      color: "bg-indigo-500",
      textColor: "text-indigo-400",
    },
  ]

  return (
    <Card className="border-0 bg-white/10 backdrop-blur-sm">
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded text-sm text-red-100">{error}</div>
        )}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="w-full bg-slate-800/50">
            <TabsTrigger value="stats" className="flex-1 data-[state=active]:bg-slate-700/50">
              Stats
            </TabsTrigger>
            <TabsTrigger value="character" className="flex-1 data-[state=active]:bg-slate-700/50">
              Character
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex-1 data-[state=active]:bg-slate-700/50">
              <Users className="w-4 h-4 mr-1" />
              Friends
            </TabsTrigger>
          </TabsList>

          {/* Stats Content */}
          <TabsContent value="stats" className="mt-4 space-y-4">
            {statsConfig.map((stat) => {
              const skillLevel = calculateLevel(stat.value)
              const progress = calculateLevelProgress(stat.value)

              return (
                <div key={stat.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                      <span className="text-sm font-medium">{stat.name}</span>
                    </div>
                    <span className="text-xs font-medium">Level {skillLevel}</span>
                  </div>
                  <div className="relative pt-1">
                    <Progress value={progress} className="h-2 bg-white/10" indicatorClassName={stat.color} />
                    <span className="absolute right-0 text-xs text-white/70 -bottom-4">{stat.value}</span>
                  </div>
                </div>
              )
            })}
          </TabsContent>

          {/* Character Content */}
          <TabsContent value="character" className="mt-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-32 h-32 relative">
                <div className="absolute inset-4">
                  {equippedBorderUrl && (
                    <img
                      src={equippedBorderUrl || "/placeholder.svg"}
                      alt="Character Border"
                      className="absolute inset-0 w-full h-full object-contain z-10"
                    />
                  )}
                  <img
                    src={equippedAvatarUrl || "/placeholder.svg"}
                    alt="Character Avatar"
                    className="w-full h-full object-cover rounded-lg relative z-0 bg-slate-800"
                  />
                </div>
                {equippedHatUrl && (
                  <img
                    src={equippedHatUrl || "/placeholder.svg"}
                    alt="Character Hat"
                    className="absolute -top-2 -left-2 w-16 h-16 object-contain transform -rotate-45 z-20"
                  />
                )}
              </div>
              <h3 className="text-lg font-bold mt-4">{playerData?.username || "Hero Name"}</h3>
              <p className="text-sm text-white/70">{levelDescription} Fitness Adventurer</p>

              <div className="w-full mt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total XP</span>
                  <span className="text-sm font-medium">{playerData?.xp?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Level</span>
                  <span className="text-sm font-medium">{playerData?.level || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gold</span>
                  <span className="text-sm font-medium">{playerData?.gold?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Friends Content */}
          <TabsContent value="friends" className="mt-4">
            <div className="space-y-4">
              {userId ? (
                <>
                  {/* Search functionality */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/50" />
                    <Input
                      placeholder="Search for friends..."
                      className="pl-10 bg-white/10 border-white/10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <Button
                      size="sm"
                      className="absolute right-1 top-1 h-8"
                      onClick={handleSearch}
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Search Results</h3>
                      {searchResults.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                              {user.profile_picture_url ? (
                                <img
                                  src={user.profile_picture_url || "/placeholder.svg"}
                                  alt={user.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <Users className="w-4 h-4 text-indigo-400" />
                              )}
                            </div>
                            <span className="text-sm">{user.username}</span>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleAddFriend(user.id)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Friend
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Friend Requests Section */}
                  {pendingRequests.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Friend Requests</h3>
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                              {request.sender_profile_picture ? (
                                <img
                                  src={request.sender_profile_picture || "/placeholder.svg"}
                                  alt={request.sender_username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <Users className="w-4 h-4 text-indigo-400" />
                              )}
                            </div>
                            <span className="text-sm">{request.sender_username}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRespondToRequest(request.id, "accepted")}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRespondToRequest(request.id, "rejected")}
                            >
                              <UserMinus className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Friends List */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Your Friends ({friends.length})</h3>
                    {friends.length === 0 ? (
                      <p className="text-sm text-white/70 text-center py-4">
                        You don't have any friends yet. Search for users to add them as friends!
                      </p>
                    ) : (
                      friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                              {friend.profile_picture_url ? (
                                <img
                                  src={friend.profile_picture_url || "/placeholder.svg"}
                                  alt={friend.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <Users className="w-4 h-4 text-indigo-400" />
                              )}
                            </div>
                            <span className="text-sm">{friend.username}</span>
                          </div>
                          {/* Friend status indicator */}
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Friend
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/70 text-center py-4">Please log in to view and manage your friends.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

