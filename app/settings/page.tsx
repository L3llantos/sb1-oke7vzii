"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, User, Brush, LogOut } from "lucide-react"
import { getCurrentUser, uploadProfilePicture, deleteProfilePicture, signOut } from "@/lib/supabase"
import { getPlayerData, updatePlayerData } from "@/lib/player-db"
import CharacterCustomization from "@/components/CharacterCustomization"
import { RefreshProvider } from "@/lib/refresh-context"

// Create a wrapper component that uses the RefreshProvider
function SettingsContent() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [currentPictureUrl, setCurrentPictureUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playerData, setPlayerData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    const loadUserData = async () => {
      const user = await getCurrentUser()
      if (user) {
        const data = await getPlayerData(user.id)
        if (data) {
          setPlayerData(data)
          setUsername(data.username || "")
          setCurrentPictureUrl(data.profile_picture_url || "")
          setPreviewUrl(data.profile_picture_url || "")
        }
      } else {
        // Redirect to login if not logged in
        router.push("/")
      }
    }
    loadUserData()
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfilePicture(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const user = await getCurrentUser()
    if (!user) {
      setError("User not found")
      setIsLoading(false)
      return
    }

    try {
      let profilePictureUrl = currentPictureUrl
      if (profilePicture) {
        if (currentPictureUrl) {
          const oldFileName = currentPictureUrl.split("/").pop()
          if (oldFileName) {
            await deleteProfilePicture(user.id, oldFileName)
          }
        }
        profilePictureUrl = await uploadProfilePicture(user.id, profilePicture)
      }

      const success = await updatePlayerData(user.id, {
        username,
        profile_picture_url: profilePictureUrl,
      })

      if (success) {
        // Stay on the page but show success message
        setIsLoading(false)
      } else {
        throw new Error("Failed to update settings")
      }
    } catch (err) {
      setError("An error occurred while saving settings")
      console.error(err)
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      setError("Failed to sign out. Please try again.")
    }
  }

  const handleCharacterUpdate = async () => {
    // Refresh player data after character update
    const user = await getCurrentUser()
    if (user) {
      const data = await getPlayerData(user.id)
      if (data) {
        setPlayerData(data)
      }
    }
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
          <h1 className="text-xl font-bold">Settings</h1>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-slate-800/50 mb-4">
            <TabsTrigger value="profile" className="flex-1 data-[state=active]:bg-slate-700/50">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="character" className="flex-1 data-[state=active]:bg-slate-700/50">
              <Brush className="w-4 h-4 mr-2" />
              Character
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Update Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="profilePicture" className="block text-sm font-medium mb-1">
                      Profile Picture
                    </label>
                    <Input
                      id="profilePicture"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="bg-white/5 border-white/10"
                    />
                    {previewUrl && (
                      <div className="mt-2">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Profile preview"
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
                <Button onClick={handleLogout} variant="destructive" className="w-full mt-4">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="character">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Customize Your Character</CardTitle>
              </CardHeader>
              <CardContent>
                {playerData ? (
                  <CharacterCustomization
                    playerId={playerData.id}
                    initialEquippedAvatar={playerData.equipped_avatar}
                    initialEquippedHat={playerData.equipped_hat}
                    initialEquippedBorder={playerData.equipped_border}
                    initialInventory={playerData.inventory}
                    playerLevel={playerData.level} // Add this line to pass the player's level
                    onUpdate={handleCharacterUpdate}
                    showTitle={false}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p>Loading character data...</p>
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

// Main component that wraps the content with RefreshProvider
export default function SettingsPage() {
  return (
    <RefreshProvider>
      <SettingsContent />
    </RefreshProvider>
  )
}

