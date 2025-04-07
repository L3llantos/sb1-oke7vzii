"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
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
import { getCurrentUser } from "@/lib/supabase"
import { getUserDailyTasks, completeTask, type UserDailyTask } from "@/lib/daily-tasks"
import Link from "next/link"

export default function DailyTasksPanel() {
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
        return <Dumbbell className="w-4 h-4 text-red-400" />
      case "endurance":
        return <Flame className="w-4 h-4 text-orange-400" />
      case "flexibility":
        return <Activity className="w-4 h-4 text-green-400" />
      case "agility":
      case "speed":
        return <Zap className="w-4 h-4 text-yellow-400" />
      case "brainpower":
        return <Brain className="w-4 h-4 text-indigo-400" />
      case "reaction":
        return <Timer className="w-4 h-4 text-purple-400" />
      case "game":
        return <Gamepad2 className="w-4 h-4 text-blue-400" />
      case "special":
        return <Sparkles className="w-4 h-4 text-pink-400" />
      default:
        return <Trophy className="w-4 h-4 text-blue-400" />
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading daily tasks...</div>
  }

  if (error) {
    return <div className="text-red-300 p-2">{error}</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Daily Tasks</h2>
        <span className="text-xs text-white/70">
          {completedCount}/{tasks.length} completed
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress</span>
          <span>
            {completedCount}/{tasks.length}
          </span>
        </div>
        <Progress value={(completedCount / Math.max(1, tasks.length)) * 100} className="h-1.5 bg-white/10" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1 text-yellow-400 text-xs">
          <Trophy className="w-3 h-3" />
          <span>{rewards.xp} XP</span>
        </div>
        <div className="flex items-center gap-1 text-yellow-400 text-xs">
          <Sparkles className="w-3 h-3" />
          <span>{rewards.gold} Gold</span>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className={`p-3 rounded-lg ${task.completed ? "bg-green-500/20" : "bg-white/5"}`}>
            <div className="flex items-start gap-3">
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 p-0 ${task.completed ? "text-green-400 cursor-default" : "text-white/50 hover:text-white"}`}
                onClick={() => !task.completed && handleCompleteTask(task.id)}
                disabled={task.completed}
              >
                {task.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </Button>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    {getCategoryIcon(task.category)}
                    <span>{task.title}</span>
                  </h3>
                </div>
                <p className="mt-1 text-xs text-white/70">{task.description}</p>

                <div className="flex justify-end items-center mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-400">{task.xp_reward} XP</span>
                    <span className="text-xs text-yellow-400">{task.gold_reward} Gold</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {tasks.length > 3 && (
          <Link href="/daily-tasks">
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs border-white/10 bg-white/5 hover:bg-white/10"
            >
              View All Tasks
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

