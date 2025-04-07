"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, CheckCircle, AlertCircle } from "lucide-react"
import { getCurrentUser } from "@/lib/supabase"
import { checkAndCompleteNewActivityTask, checkAndCompleteSportsTask } from "@/lib/task-utils"

export default function TaskFixerPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [activityName, setActivityName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      if (user) {
        setUserId(user.id)
      }
    }
    fetchUser()
  }, [])

  const handleCheckNewActivity = async () => {
    if (!userId || !activityName) return

    setIsLoading(true)
    setResult(null)

    try {
      const success = await checkAndCompleteNewActivityTask(userId, activityName)

      if (success) {
        setResult({
          success: true,
          message: `Successfully completed "Try Something New" task with activity: ${activityName}`,
        })
      } else {
        setResult({
          success: false,
          message: `Could not complete "Try Something New" task. The activity might not be new or the task doesn't exist.`,
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setResult({
        success: false,
        message: "An error occurred. Check the console for details.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckSportsTask = async () => {
    if (!userId || !activityName) return

    setIsLoading(true)
    setResult(null)

    try {
      const success = await checkAndCompleteSportsTask(userId, activityName)

      if (success) {
        setResult({
          success: true,
          message: `Successfully completed "Sports activity with rapid movements" task with activity: ${activityName}`,
        })
      } else {
        setResult({
          success: false,
          message: `Could not complete "Sports activity" task. The activity might not be a recognized sport or the task doesn't exist.`,
        })
      }
    } catch (error) {
      console.error("Error:", error)
      setResult({
        success: false,
        message: "An error occurred. Check the console for details.",
      })
    } finally {
      setIsLoading(false)
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
          <h1 className="text-xl font-bold">Task Fixer</h1>
        </header>

        <Card className="border-0 bg-white/10 backdrop-blur-sm mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Manually Check and Complete Tasks</h2>
            <p className="text-sm text-white/70 mb-4">
              This utility helps fix issues with daily tasks that should have been completed automatically. Enter the
              activity name and click the appropriate button.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="activityName" className="block text-sm font-medium mb-1">
                  Activity Name
                </label>
                <Input
                  id="activityName"
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="e.g., Dodgeball"
                  className="bg-white/10 border-white/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCheckNewActivity}
                  disabled={isLoading || !activityName || !userId}
                  className="w-full"
                >
                  Check & Complete "Try Something New" Task
                </Button>

                <Button
                  onClick={handleCheckSportsTask}
                  disabled={isLoading || !activityName || !userId}
                  className="w-full"
                >
                  Check & Complete "Sports with Rapid Movements" Task
                </Button>
              </div>

              {result && (
                <div className={`p-3 rounded-lg ${result.success ? "bg-green-500/20" : "bg-red-500/20"} mt-4`}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    )}
                    <p className="text-sm">{result.message}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <h3 className="text-md font-semibold mb-2">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-white/70">
              <li>Enter the exact activity name you logged (e.g., "Dodgeball")</li>
              <li>Click the appropriate button for the task you want to complete</li>
              <li>If successful, the task will be marked as completed and you'll receive the rewards</li>
              <li>If unsuccessful, check the error message for details</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

