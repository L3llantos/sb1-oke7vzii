import { supabase } from "./supabase"

export interface Friend {
  id: string
  username: string
  profile_picture_url?: string
}

export async function getFriends(userId: string): Promise<Friend[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("friend_id, players!friendships_friend_id_fkey(id, username, profile_picture_url)")
    .eq("user_id", userId)
    .eq("status", "accepted")

  if (error) {
    console.error("Error fetching friends:", error)
    return []
  }

  return data.map((friendship) => ({
    id: friendship.players.id,
    username: friendship.players.username,
    profile_picture_url: friendship.players.profile_picture_url,
  }))
}

export async function searchUsersByUsername(query: string, currentUserId: string): Promise<Friend[]> {
  const { data, error } = await supabase
    .from("players")
    .select("id, username, profile_picture_url")
    .ilike("username", `%${query}%`)
    .neq("id", currentUserId)
    .limit(10)

  if (error) {
    console.error("Error searching users:", error)
    return []
  }

  return data
}

export async function sendFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
  const { error } = await supabase
    .from("friendships")
    .insert({ user_id: senderId, friend_id: receiverId, status: "pending" })

  if (error) {
    console.error("Error sending friend request:", error)
    return false
  }

  return true
}

export async function getPendingFriendRequests(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select("id, user_id, players!friendships_user_id_fkey(username)")
    .eq("friend_id", userId)
    .eq("status", "pending")

  if (error) {
    console.error("Error fetching pending friend requests:", error)
    return []
  }

  return data.map((request) => ({
    id: request.id,
    sender_id: request.user_id,
    sender_username: request.players.username,
  }))
}

export async function respondToFriendRequest(requestId: string, response: "accepted" | "rejected"): Promise<boolean> {
  const { error } = await supabase.from("friendships").update({ status: response }).eq("id", requestId)

  if (error) {
    console.error("Error responding to friend request:", error)
    return false
  }

  return true
}

