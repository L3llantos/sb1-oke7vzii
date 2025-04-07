import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Trophy, Lock, Dumbbell, Brain, Zap, Flame, Footprints, Activity } from "lucide-react"

export default function AchievementsPage() {
  const achievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first activity",
      icon: Footprints,
      progress: 100,
      completed: true,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      reward: "+50 XP",
    },
    {
      id: 2,
      name: "Strength Novice",
      description: "Reach level 5 in Strength",
      icon: Dumbbell,
      progress: 80,
      completed: false,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      reward: "+100 XP",
    },
    {
      id: 3,
      name: "Endurance Master",
      description: "Complete 20 cardio workouts",
      icon: Flame,
      progress: 45,
      completed: false,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      reward: "+150 XP",
    },
    {
      id: 4,
      name: "Mind Over Matter",
      description: "Reach level 10 in Brainpower",
      icon: Brain,
      progress: 20,
      completed: false,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/20",
      reward: "+200 XP",
    },
    {
      id: 5,
      name: "Flexibility Guru",
      description: "Complete 15 yoga or stretching sessions",
      icon: Activity,
      progress: 60,
      completed: false,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      reward: "+150 XP",
    },
    {
      id: 6,
      name: "Speed Demon",
      description: "Reach level 8 in Speed",
      icon: Zap,
      progress: 30,
      completed: false,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      reward: "+175 XP",
    },
    {
      id: 7,
      name: "Balanced Warrior",
      description: "Have all skills at level 5 or higher",
      icon: Trophy,
      progress: 10,
      completed: false,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
      reward: "+500 XP",
    },
  ]

  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container px-4 py-6 mx-auto max-w-md">
        <header className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Achievements</h1>
        </header>

        <div className="p-4 mb-6 rounded-lg bg-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Achievement Progress</h2>
              <p className="text-sm text-white/70">7 total achievements</p>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-500/20 rounded-full text-purple-300">
              <Trophy className="w-3 h-3" />
              <span>2/7 Unlocked</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`border-0 overflow-hidden ${achievement.completed ? "bg-white/10" : "bg-white/5"} backdrop-blur-sm`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${achievement.bgColor}`}>
                    {achievement.completed ? (
                      <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
                    ) : (
                      <Lock className="w-4 h-4 text-white/70" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{achievement.name}</h3>
                      <span className="text-xs font-medium text-white/70">{achievement.reward}</span>
                    </div>
                    <p className="mt-1 text-xs text-white/70">{achievement.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/70">{achievement.progress}%</span>
                      </div>
                      <Progress value={achievement.progress} className="h-1.5 bg-white/10" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

