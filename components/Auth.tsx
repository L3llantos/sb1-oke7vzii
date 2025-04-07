"use client"

import type React from "react"
import { useState } from "react"
import { signUp, signIn } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Auth({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const authFunction = isSignUp ? signUp : signIn
    const { data, error } = await authFunction(email, password)

    if (error) {
      console.error(`${isSignUp ? "Sign up" : "Sign in"} error:`, error)
      setError(error.message)
    } else if (data) {
      console.log(`${isSignUp ? "Sign up" : "Sign in"} successful:`, data)
      onAuth()
    }

    setIsLoading(false)
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                id="email"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Input
                id="password"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
          <div className="flex justify-between mt-4">
            <Button type="submit" disabled={isLoading}>
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              disabled={isLoading}
            >
              {isSignUp ? "Switch to Sign In" : "Switch to Sign Up"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

