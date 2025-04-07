"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  CheckCircle2,
  Circle,
  Trophy,
  Dumbbell,
  Flame,
  Activity,
  Zap,
  Brain,
  Timer,
  Gamepad2,
  Sparkles,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { getCurrentUser } from "@/lib/supabase"
import { getUserDailyTasks, completeTask, type UserDailyTask } from "@/lib/daily-tasks"

export default function DailyTasksPage() {
  const [tasks, setTasks] = useState<UserDailyTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [completedCount, setCompletedCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [rewards, setRewards] = useState({ xp: 0, gold: 0 })
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchDailyTasks()
  }, [])

  const fetchDailyTasks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const user = await getCurrentUser()
      if (!user) {
        setError("You must be logged in to view daily tasks")
        setIsLoading(false)
        return
      }

      setUserId(user.id)
      const dailyTasks = await getUserDailyTasks(user.id)
      setTasks(dailyTasks)

      const completed = dailyTasks.filter((task) => task.completed).length
      setCompletedCount(completed)

      // Calculate rewards
      let totalXp = 0
      let totalGold = 0
      dailyTasks.forEach((task) => {
        if (task.completed) {
          totalXp += task.xp_reward
          totalGold += task.gold_reward
        }
      })
      setRewards({ xp: totalXp, gold: totalGold })
    } catch (error) {
      console.error("Error fetching daily tasks:", error)
      setError("Failed to load daily tasks. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    if (!userId) return

    try {
      const success = await completeTask(userId, taskId)
      if (success) {
        // Update the tasks list
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, completed: true, completed_at: new Date().toISOString() } : task,
          ),
        )

        // Update the completed count and rewards
        setCompletedCount((prev) => prev + 1)

        // Find the task that was completed
        const completedTask = tasks.find((task) => task.id === taskId)
        if (completedTask) {
          setRewards((prev) => ({
            xp: prev.xp + completedTask.xp_reward,
            gold: prev.gold + completedTask.gold_reward,
          }))
        }
      }
    } catch (error) {
      console.error("Error completing task:", error)
      setError("Failed to complete task. Please try again.")
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "strength":
        return <Dumbbell className="w-5 h-5 text-red-400" />
      case "endurance":
        return <Flame className="w-5 h-5 text-orange-400" />
      case "flexibility":
        return <Activity className="w-5 h-5 text-green-400" />
      case "agility":
      case "speed":
        return <Zap className="w-5 h-5 text-yellow-400" />
      case "brainpower":
        return <Brain className="w-5 h-5 text-indigo-400" />
      case "reaction":
        return <Timer className="w-5 h-5 text-purple-400" />
      case "game":
        return <Gamepad2 className="w-5 h-5 text-blue-400" />
      case "special":
        return <Sparkles className="w-5 h-5 text-pink-400" />
      default:
        return <Trophy className="w-5 h-5 text-blue-400" />
    }
  }

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Easy"
      case 2:
        return "Medium"
      case 3:
        return "Hard"
      default:
        return "Medium"
    }
  }

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "text-green-400"
      case 2:
        return "text-yellow-400"
      case 3:
        return "text-red-400"
      default:
        return "text-yellow-400"
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
          <h1 className="text-xl font-bold">Daily Tasks</h1>
        </header>

        <Card className="mb-6 border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Today's Tasks</h2>
              <span className="text-sm">
                {completedCount}/{tasks.length} Completed
              </span>
            </div>
            <Progress value={(completedCount / Math.max(1, tasks.length)) * 100} className="h-2 mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 text-yellow-400">
                <Trophy className="w-4 h-4" />
                <span>{rewards.xp} XP</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Sparkles className="w-4 h-4" />
                <span>{rewards.gold} Gold</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-0 bg-red-500/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card className="border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p>Loading daily tasks...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className={`border-0 ${task.completed ? "bg-green-500/10" : "bg-white/10"} backdrop-blur-sm transition-all duration-300`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`mt-1 ${task.completed ? "text-green-400 cursor-default" : "text-white/50 hover:text-white"}`}
                      onClick={() => !task.completed && handleCompleteTask(task.id)}
                      disabled={task.completed}
                    >
                      {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </Button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          {getCategoryIcon(task.category)}
                          {task.title}
                        </h3>
                        <span className={`text-xs ${getDifficultyColor(task.difficulty)}`}>
                          {getDifficultyLabel(task.difficulty)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/70">{task.description}</p>

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1 text-xs text-white/50">
                          {task.completed && task.completed_at && (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-green-400" />
                              <span>Completed {new Date(task.completed_at).toLocaleTimeString()}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-yellow-400">{task.xp_reward} XP</span>
                          <span className="text-xs text-yellow-400">{task.gold_reward} Gold</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

