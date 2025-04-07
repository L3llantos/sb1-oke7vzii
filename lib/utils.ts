import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { supabase } from "./supabase"

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

