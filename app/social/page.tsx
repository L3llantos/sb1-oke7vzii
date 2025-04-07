"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Users, Search, UserPlus, UserMinus, UserCheck, RefreshCw } from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import {
  getFriends,
  getPendingFriendRequests,
  searchUsersByUsername,
  sendFriendRequest,
  respondToFriendRequest,
  type Friend,
} from "@/lib/friend-functions"

export default function SocialPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Friend[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("friends")
  const [userId, setUserId] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const user = await getCurrentUser()
      if (user) {
        setUserId(user.id)
        const friendsList = await getFriends(user.id)
        setFriends(friendsList)

        const requests = await getPendingFriendRequests(user.id)
        setPendingRequests(requests)
      }
    } catch (error) {
      console.error("Error fetching social data:", error)
      setError("Failed to load social data. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !userId) return

    setIsSearching(true)
    setError(null)
    try {
      const results = await searchUsersByUsername(searchQuery, userId)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching for users:", error)
      setError("Failed to search for users. Please try again.")
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
      } else {
        setError("Failed to send friend request. Please try again.")
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
      setError("An error occurred while sending the friend request.")
    }
  }

  const handleRespondToRequest = async (requestId: string, response: "accepted" | "rejected") => {
    try {
      const success = await respondToFriendRequest(requestId, response)
      if (success) {
        setPendingRequests((prev) => prev.filter((request) => request.id !== requestId))
        if (response === "accepted") {
          // Refresh friends list
          if (userId) {
            const friendsList = await getFriends(userId)
            setFriends(friendsList)
          }
        }
      } else {
        setError(`Failed to ${response} friend request. Please try again.`)
      }
    } catch (error) {
      console.error("Error responding to friend request:", error)
      setError(`An error occurred while ${response === "accepted" ? "accepting" : "rejecting"} the friend request.`)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="container px-4 py-6 mx-auto max-w-md">
          <header className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Social</h1>
          </header>
          <div className="flex justify-center py-8">
            <p>Loading social data...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container px-4 py-6 mx-auto max-w-md">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-2">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Social</h1>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </header>

        {error && (
          <Card className="mb-4 border-0 bg-red-500/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-sm text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="friends" className="data-[state=active]:bg-blue-600">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-blue-600">
              <UserCheck className="w-4 h-4 mr-2" />
              Requests
              {pendingRequests.length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="search" className="data-[state=active]:bg-blue-600">
              <Search className="w-4 h-4 mr-2" />
              Find
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Your Friends</h2>
                {friends.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    <Users className="w-12 h-12 mx-auto mb-2 text-white/30" />
                    <p>You don't have any friends yet</p>
                    <p className="text-sm mt-2">Search for users to add them as friends!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            {friend.profile_picture_url ? (
                              <img
                                src={friend.profile_picture_url || "/placeholder.svg"}
                                alt={friend.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium">{friend.username}</h3>
                            <Link href={`/pvp-arena?friend=${friend.id}`}>
                              <Button variant="link" size="sm" className="p-0 h-auto text-xs text-blue-400">
                                Challenge to Battle
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    <UserCheck className="w-12 h-12 mx-auto mb-2 text-white/30" />
                    <p>No pending friend requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            {request.sender_profile_picture ? (
                              <img
                                src={request.sender_profile_picture || "/placeholder.svg"}
                                alt={request.sender_username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                          <span className="text-sm">{request.sender_username}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-500/20 border-green-500/50 hover:bg-green-500/30"
                            onClick={() => handleRespondToRequest(request.id, "accepted")}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30"
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Find Friends</h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-white/10 border-white/20"
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            {user.profile_picture_url ? (
                              <img
                                src={user.profile_picture_url || "/placeholder.svg"}
                                alt={user.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-blue-400" />
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
                ) : searchQuery && !isSearching ? (
                  <div className="text-center py-8 text-white/70">
                    <Search className="w-12 h-12 mx-auto mb-2 text-white/30" />
                    <p>No users found matching "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-white/70">
                    <Search className="w-12 h-12 mx-auto mb-2 text-white/30" />
                    <p>Search for users by username</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

