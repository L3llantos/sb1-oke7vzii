"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Check, FileCheck, Smartphone, Tablet } from "lucide-react"

export default function MobileReadyPage() {
  return (
    <main className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container px-4 py-6 mx-auto max-w-md">
        <header className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Mobile Optimization Complete</h1>
        </header>

        <Card className="border-0 bg-white/10 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-400" />
              Optimization Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Removed Unused Files</h3>
                  <p className="text-xs text-white/70">Cleaned up development utilities and duplicate files</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Optimized Image Loading</h3>
                  <p className="text-xs text-white/70">Implemented lazy loading and better error handling</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Added Offline Support</h3>
                  <p className="text-xs text-white/70">Service worker and IndexedDB for offline functionality</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Mobile-Specific Features</h3>
                  <p className="text-xs text-white/70">Touch events, responsive design, and device detection</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Capacitor Configuration</h3>
                  <p className="text-xs text-white/70">Set up for iOS and Android deployment</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-between h-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-2">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-sm font-medium text-center">iOS Build</h3>
                <p className="text-xs text-white/70 text-center mb-2">Build for iPhone & iPad</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => alert("This would run: npm run ios")}
                >
                  Open in Xcode
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/10 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex flex-col items-center justify-between h-full">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-2">
                  <Tablet className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-sm font-medium text-center">Android Build</h3>
                <p className="text-xs text-white/70 text-center mb-2">Build for Android devices</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => alert("This would run: npm run android")}
                >
                  Open in Android Studio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
          onClick={() => alert("This would run: npm run build:mobile")}
        >
          Build for Mobile
        </Button>
      </div>
    </main>
  )
}

