import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export async function uploadProfilePicture(userId: string, file: File) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage.from("profile-pictures").upload(fileName, file, { upsert: true })

  if (error) {
    throw error
  }

  const { data: urlData } = supabase.storage.from("profile-pictures").getPublicUrl(fileName)

  return urlData.publicUrl
}

export async function deleteProfilePicture(userId: string, fileName: string) {
  const { data, error } = await supabase.storage.from("profile-pictures").remove([fileName])

  if (error) {
    throw error
  }

  return data
}

export async function getGameAssetUrl(assetName: string) {
  const { data } = supabase.storage.from("game-assets").getPublicUrl(assetName)

  return data.publicUrl
}

export const signUp = async (email: string, password: string) => {
  console.log("Attempting to sign up with email:", email)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) {
    console.error("Sign up error:", error)
  } else {
    console.log("Sign up successful:", data)
  }
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  console.log("Attempting to sign in with email:", email)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    console.error("Sign in error:", error)
  } else {
    console.log("Sign in successful:", data)
  }
  return { data, error }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

