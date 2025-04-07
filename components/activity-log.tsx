"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Dumbbell, Footprints, Activity, Trash2, AlertCircle } from "lucide-react"
import { getRecentActivities, deleteActivity, type Activity as ActivityType } from "@/lib/activity-db"
import { getCurrentUser } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRefreshContext } from "@/lib/refresh-context"

export default function ActivityLog() {
  const [recentActivities, setRecentActivities] = useState<ActivityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activityToDelete, setActivityToDelete] = useState<ActivityType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { refreshTrigger, triggerRefresh } = useRefreshContext()

  const fetchActivities = async () => {
    setIsLoading(true)
    const user = await getCurrentUser()
    if (user) {
      const activities = await getRecentActivities(user.id)
      console.log("Fetched activities:", activities)
      setRecentActivities(activities)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchActivities()
  }, [refreshTrigger])

  const confirmDelete = (activity: ActivityType) => {
    setActivityToDelete(activity)
  }

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error("User not found")
      }

      console.log(`Deleting activity ${activityToDelete.id} for user ${user.id}`)
      const success = await deleteActivity(user.id, activityToDelete.id)

      if (success) {
        console.log("Activity deleted successfully")
        setRecentActivities((prev) => prev.filter((a) => a.id !== activityToDelete.id))
        setActivityToDelete(null)
        triggerRefresh()
      } else {
        throw new Error("Failed to delete activity")
      }
    } catch (error) {
      console.error("Error in handleDeleteActivity:", error)
      setDeleteError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const getIcon = (activityName: string) => {
    if (activityName.toLowerCase().includes("strength")) return Dumbbell
    if (activityName.toLowerCase().includes("run")) return Footprints
    return Activity
  }

  return (
    <>
      <Card className="border-0 bg-white/10 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
            <Button variant="outline" size="sm" onClick={fetchActivities} disabled={isLoading}>
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
          {isLoading ? (
            <div className="flex justify-center p-4">
              <p>Loading activities...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const Icon = getIcon(activity.name)
                return (
                  <div key={activity.id} className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">{activity.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/70">{activity.duration} min</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => confirmDelete(activity)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-white/70">{new Date(activity.created_at).toLocaleString()}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(activity.xp_gained).map(([skill, value]) => (
                            <div key={skill} className="px-2 py-1 text-xs rounded-full bg-white/10">
                              +{value} {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {recentActivities.length === 0 && <p className="text-center text-white/70">No recent activities</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!activityToDelete} onOpenChange={(open) => !open && setActivityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Delete Activity
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This will remove all XP gained from this activity from your
              stats.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {activityToDelete && (
            <div className="mt-2 p-3 bg-white/5 rounded">
              <div className="font-medium">{activityToDelete.name}</div>
              <div className="text-sm">
                {activityToDelete.duration} minutes • Intensity: {activityToDelete.intensity}/10
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {activityToDelete.xp_gained &&
                  Object.entries(activityToDelete.xp_gained).map(([skill, value]) => (
                    <span key={skill} className="text-xs bg-white/10 px-1.5 py-0.5 rounded">
                      -{value} {skill}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {deleteError && (
            <div className="mt-2 p-2 bg-red-500/20 text-red-200 rounded text-sm">Error: {deleteError}</div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDeleteActivity}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

