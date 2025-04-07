import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Search, Dumbbell, Brain, Zap, Flame, Activity } from "lucide-react"

export default function ActivitiesPage() {
  const activityCategories = [
    {
      name: "Strength Training",
      description: "Build muscle and power",
      icon: Dumbbell,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      skills: [
        { name: "Strength", value: "++++" },
        { name: "Endurance", value: "++" },
      ],
      activities: ["Weight Training", "Bodyweight Exercises", "Resistance Bands", "Kettlebells"],
    },
    {
      name: "Cardio",
      description: "Improve heart health and stamina",
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      skills: [
        { name: "Endurance", value: "++++" },
        { name: "Speed", value: "+++" },
        { name: "Agility", value: "++" },
      ],
      activities: ["Running", "Cycling", "Swimming", "Rowing", "Jump Rope"],
    },
    {
      name: "Flexibility",
      description: "Enhance range of motion",
      icon: Activity,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
      skills: [
        { name: "Flexibility", value: "++++" },
        { name: "Brainpower", value: "++" },
      ],
      activities: ["Yoga", "Stretching", "Pilates", "Mobility Work"],
    },
    {
      name: "Sports",
      description: "Develop all-around fitness",
      icon: Zap,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
      skills: [
        { name: "Agility", value: "+++" },
        { name: "Speed", value: "+++" },
        { name: "Reactions", value: "+++" },
        { name: "Endurance", value: "++" },
      ],
      activities: ["Basketball", "Soccer", "Tennis", "Volleyball", "Martial Arts"],
    },
    {
      name: "Mind & Focus",
      description: "Sharpen mental abilities",
      icon: Brain,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/20",
      skills: [
        { name: "Brainpower", value: "++++" },
        { name: "Reactions", value: "++" },
      ],
      activities: ["Meditation", "Chess", "Reading", "Puzzles"],
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
          <h1 className="text-xl font-bold">Activities</h1>
        </header>

        <div className="relative mb-6">
          <Search className="absolute w-5 h-5 text-white/50 left-3 top-2.5" />
          <Input
            placeholder="Search activities..."
            className="pl-10 bg-white/10 border-white/10 placeholder:text-white/50"
          />
        </div>

        <div className="space-y-4">
          {activityCategories.map((category) => (
            <Card key={category.name} className="border-0 overflow-hidden bg-white/10 backdrop-blur-sm">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${category.bgColor}`}>
                      <category.icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">{category.name}</h2>
                      <p className="text-sm text-white/70">{category.description}</p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {category.skills.map((skill) => (
                          <div key={skill.name} className="px-2 py-1 text-xs rounded-full bg-white/10">
                            {skill.name} {skill.value}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-white/10 bg-white/5">
                  <h3 className="mb-2 text-sm font-medium">Activities:</h3>
                  <div className="flex flex-wrap gap-2">
                    {category.activities.map((activity) => (
                      <Link key={activity} href={`/log-activity?activity=${encodeURIComponent(activity)}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-white/10 bg-white/5 hover:bg-white/10"
                        >
                          {activity}
                        </Button>
                      </Link>
                    ))}
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

