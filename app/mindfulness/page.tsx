"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  Brain,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Sparkles,
  Award,
  Flame,
} from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import { getPlayerData } from "@/lib/player-db"

interface MeditationSession {
  id: string
  title: string
  description: string
  duration: number // in minutes
  category: string
  level: "beginner" | "intermediate" | "advanced"
  audioUrl: string
  imageUrl: string
  xpReward: number
}

export default function MindfulnessPage() {
  const [playerData, setPlayerData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("meditate")
  const [sessions, setSessions] = useState<MeditationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const user = await getCurrentUser()
      if (user) {
        const data = await getPlayerData(user.id)
        if (data) {
          setPlayerData(data)

          // Get meditation streak from local storage in a real app
          // This would come from the backend
          const mockStreak = 3
          setStreak(mockStreak)
        }

        // In a real app, this would come from an API
        const mockSessions: MeditationSession[] = [
          {
            id: "breathing-basics",
            title: "Breathing Basics",
            description: "A simple guided meditation focusing on breath awareness for beginners",
            duration: 5,
            category: "breathing",
            level: "beginner",
            audioUrl: "/meditations/breathing-basics.mp3",
            imageUrl: "/meditations/breathing.jpg",
            xpReward: 50,
          },
          {
            id: "body-scan",
            title: "Body Scan Relaxation",
            description: "Progressive relaxation technique to release tension throughout your body",
            duration: 10,
            category: "relaxation",
            level: "beginner",
            audioUrl: "/meditations/body-scan.mp3",
            imageUrl: "/meditations/body-scan.jpg",
            xpReward: 100,
          },
          {
            id: "focus-mind",
            title: "Focus & Clarity",
            description: "Improve concentration and mental clarity with this guided session",
            duration: 15,
            category: "focus",
            level: "intermediate",
            audioUrl: "/meditations/focus.mp3",
            imageUrl: "/meditations/focus.jpg",
            xpReward: 150,
          },
          {
            id: "stress-relief",
            title: "Stress Relief",
            description: "Release stress and anxiety with this calming meditation",
            duration: 10,
            category: "stress",
            level: "beginner",
            audioUrl: "/meditations/stress-relief.mp3",
            imageUrl: "/meditations/stress.jpg",
            xpReward: 100,
          },
          {
            id: "sleep-well",
            title: "Sleep Well",
            description: "Prepare your mind and body for restful sleep",
            duration: 20,
            category: "sleep",
            level: "beginner",
            audioUrl: "/meditations/sleep.mp3",
            imageUrl: "/meditations/sleep.jpg",
            xpReward: 200,
          },
          {
            id: "mindful-awareness",
            title: "Mindful Awareness",
            description: "Develop present moment awareness and acceptance",
            duration: 15,
            category: "mindfulness",
            level: "intermediate",
            audioUrl: "/meditations/mindful-awareness.mp3",
            imageUrl: "/meditations/mindfulness.jpg",
            xpReward: 150,
          },
        ]

        setSessions(mockSessions)
      }
      setIsLoading(false)
    }

    fetchData()

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const selectSession = (session: MeditationSession) => {
    setSelectedSession(session)
    setIsPlaying(false)
    setCurrentTime(0)

    // Reset audio element
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Create new audio element
    const audio = new Audio(session.audioUrl)
    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
    })
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)
    })
    audio.addEventListener("ended", () => {
      setIsPlaying(false)
      setCurrentTime(0)
      // In a real app, we would record completion and award XP here
    })

    audioRef.current = audio
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "breathing":
        return <Flame className="w-4 h-4 text-blue-300" />
      case "relaxation":
        return <Sparkles className="w-4 h-4 text-purple-300" />
      case "focus":
        return <Brain className="w-4 h-4 text-yellow-300" />
      case "stress":
        return <Brain className="w-4 h-4 text-green-300" />
      case "sleep":
        return <Clock className="w-4 h-4 text-indigo-300" />
      case "mindfulness":
        return <Sparkles className="w-4 h-4 text-pink-300" />
      default:
        return <Brain className="w-4 h-4 text-blue-300" />
    }
  }

  if (isLoading) {
    return (
      <main className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white">
        <div className="container px-4 py-6 mx-auto max-w-md">
          <div className="flex items-center justify-center h-screen">
            <p>Loading mindfulness data...</p>
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
          <h1 className="text-xl font-bold">Mindfulness</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-500/20 rounded-full text-blue-300">
              <Brain className="w-3 h-3" />
              <span>+{streak} day streak</span>
            </div>
          </div>
        </header>

        <Card className="mb-6 border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">Mindfulness Progress</h2>
              <div className="flex items-center gap-1 text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300">
                <Calendar className="w-3 h-3" />
                <span>{streak} day streak</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-xs text-center mb-1">Sessions</div>
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-300">12</span>
                  </div>
                </div>
                <div className="text-xs text-center mt-1">Total</div>
              </div>

              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-xs text-center mb-1">Minutes</div>
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-300">145</span>
                  </div>
                </div>
                <div className="text-xs text-center mt-1">Practiced</div>
              </div>

              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-xs text-center mb-1">XP Earned</div>
                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-green-300">750</span>
                  </div>
                </div>
                <div className="text-xs text-center mt-1">Total</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium">Mindfulness Level</h3>
                <div className="text-xs bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-300">Level 5</div>
              </div>
              <Progress value={65} className="h-1.5 mb-1" />
              <div className="flex justify-between text-xs text-white/70">
                <span>750 / 1200 XP</span>
                <span>450 XP to Level 6</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="meditate" className="data-[state=active]:bg-blue-600">
              <Brain className="w-4 h-4 mr-2" />
              Meditate
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-blue-600">
              <Award className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="meditate" className="mt-2">
            {selectedSession ? (
              <Card className="border-0 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSession(null)} className="px-2">
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <div className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300">
                      +{selectedSession.xpReward} XP
                    </div>
                  </div>

                  <div className="relative h-40 rounded-lg overflow-hidden mb-4">
                    <img
                      src={selectedSession.imageUrl || "/placeholder.svg?height=160&width=320"}
                      alt={selectedSession.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                      <div className="p-3">
                        <h3 className="text-lg font-bold text-white">{selectedSession.title}</h3>
                        <div className="flex items-center gap-2">
                          <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">
                            {selectedSession.duration} min
                          </div>
                          <div className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white capitalize">
                            {selectedSession.level}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-white/80 mb-4">{selectedSession.description}</p>

                  <div className="space-y-4">
                    <div>
                      <Progress value={(currentTime / (duration || 1)) * 100} className="h-1.5 mb-1" />
                      <div className="flex justify-between text-xs text-white/70">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = 0
                            setCurrentTime(0)
                            if (!isPlaying) {
                              audioRef.current.play()
                              setIsPlaying(true)
                            }
                          }
                        }}
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 bg-white/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h2 className="text-lg font-semibold mb-4">Meditation Sessions</h2>

                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => selectSession(session)}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10">
                            <img
                              src={session.imageUrl || "/placeholder.svg?height=64&width=64"}
                              alt={session.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">{session.title}</h3>
                              <div className="flex items-center gap-1 text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300">
                                <Clock className="w-3 h-3" />
                                <span>{session.duration} min</span>
                              </div>
                            </div>
                            <p className="text-xs text-white/70 line-clamp-2 mt-1">{session.description}</p>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(session.category)}
                                <span className="text-xs capitalize">{session.category}</span>
                              </div>
                              <div className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/70 capitalize">
                                {session.level}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="mt-2">
            <Card className="border-0 bg-white/10 backdrop-blur-sm">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-4">Mindfulness Achievements</h2>

                <div className="space-y-3">
                  <div className="bg-green-500/10 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
                        <Award className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">First Steps</h3>
                        <p className="text-xs text-white/70">Complete your first meditation session</p>
                        <div className="text-xs text-green-400 mt-1">Unlocked!</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
                        <Award className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">Consistent Mind</h3>
                        <p className="text-xs text-white/70">Complete meditation sessions 3 days in a row</p>
                        <div className="text-xs text-green-400 mt-1">Unlocked!</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                        <Award className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">Mindfulness Master</h3>
                        <p className="text-xs text-white/70">Complete 10 different meditation sessions</p>
                        <div className="mt-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/70">Progress</span>
                            <span className="text-white/70">6/10</span>
                          </div>
                          <Progress value={60} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                        <Award className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">Zen Warrior</h3>
                        <p className="text-xs text-white/70">Complete a total of 60 minutes of meditation</p>
                        <div className="mt-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/70">Progress</span>
                            <span className="text-white/70">45/60 min</span>
                          </div>
                          <Progress value={75} className="h-1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                        <Award className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium">Inner Peace</h3>
                        <p className="text-xs text-white/70">Complete a 20-minute meditation session</p>
                        <div className="mt-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/70">Progress</span>
                            <span className="text-white/70">15/20 min</span>
                          </div>
                          <Progress value={75} className="h-1" />
                        </div>
                      </div>
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

