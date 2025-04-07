import { supabase } from "./supabase"

export interface Friend {
  id: string
  username: string
  profile_picture_url?: string
}

export async function getFriends(userId: string): Promise<Friend[]> {
  // First, get the accepted friendships
  const { data: friendships, error: friendshipsError } = await supabase
    .from("friendships")
    .select("friend_id")
    .eq("user_id", userId)
    .eq("status", "accepted")

  if (friendshipsError) {
    console.error("Error fetching friendships:", friendshipsError)
    return []
  }

  if (!friendships || friendships.length === 0) {
    return []
  }

  // Then, get the friend details
  const friendIds = friendships.map((friendship) => friendship.friend_id)
  const { data: friends, error: friendsError } = await supabase
    .from("players")
    .select("id, username, profile_picture_url")
    .in("id", friendIds)

  if (friendsError) {
    console.error("Error fetching friend details:", friendsError)
    return []
  }

  return friends || []
}

export async function searchUsersByUsername(query: string, currentUserId: string): Promise<Friend[]> {
  console.log("searchUsersByUsername called with query:", query, "and currentUserId:", currentUserId)

  if (!query.trim()) {
    console.log("Query is empty, returning []")
    return []
  }

  const { data, error } = await supabase
    .from("players")
    .select("id, username, profile_picture_url")
    .like("username", `%${query}%`)
    .neq("id", currentUserId)
    .limit(10)

  if (error) {
    console.error("Supabase Error:", error.message)
    return []
  }

  console.log("Search query result:", data)
  return data || []
}

export async function sendFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
  try {
    console.log(`Sending friend request from ${senderId} to ${receiverId}`)

    // First, check if there are any existing friendship records
    const { data: existingFriendships, error: friendshipError } = await supabase
      .from("friendships")
      .select("*")
      .or(
        `and(user_id.eq.${senderId},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${senderId})`,
      )

    if (friendshipError) {
      console.error("Error checking existing friendships:", friendshipError)
      return false
    }

    if (existingFriendships && existingFriendships.length > 0) {
      console.log("Friendship already exists, cannot send request")
      return false
    }

    // Next, check if there are any existing friend requests (in any status)
    const { data: existingRequests, error: requestError } = await supabase
      .from("friend_requests")
      .select("*")
      .or(
        `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`,
      )

    if (requestError) {
      console.error("Error checking existing friend requests:", requestError)
      return false
    }

    // If there are existing requests, we need to handle them
    if (existingRequests && existingRequests.length > 0) {
      console.log("Found existing friend requests:", existingRequests)

      // Delete all existing friend requests between these users
      const { error: deleteError } = await supabase
        .from("friend_requests")
        .delete()
        .or(
          `and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`,
        )

      if (deleteError) {
        console.error("Error deleting existing friend requests:", deleteError)
        return false
      }

      console.log("Deleted existing friend requests")
    }

    // Now create a new friend request
    const { error: insertError } = await supabase
      .from("friend_requests")
      .insert({ sender_id: senderId, receiver_id: receiverId, status: "pending" })

    if (insertError) {
      console.error("Error sending friend request:", insertError)
      return false
    }

    console.log("Friend request sent successfully")
    return true
  } catch (error) {
    console.error("Unexpected error in sendFriendRequest:", error)
    return false
  }
}

export async function getPendingFriendRequests(userId: string): Promise<any[]> {
  // First, fetch the pending friend requests
  const { data: requests, error: requestsError } = await supabase
    .from("friend_requests")
    .select("id, sender_id")
    .eq("receiver_id", userId)
    .eq("status", "pending")

  if (requestsError) {
    console.error("Error fetching pending friend requests:", requestsError)
    return []
  }

  if (!requests || requests.length === 0) {
    return []
  }

  // Then, fetch the sender details for these requests
  const senderIds = requests.map((request) => request.sender_id)
  const { data: senders, error: sendersError } = await supabase
    .from("players")
    .select("id, username, profile_picture_url")
    .in("id", senderIds)

  if (sendersError) {
    console.error("Error fetching sender details:", sendersError)
    return []
  }

  // Combine the data
  return requests.map((request) => {
    const sender = senders?.find((s) => s.id === request.sender_id)
    return {
      id: request.id,
      sender_id: request.sender_id,
      sender_username: sender?.username || "Unknown User",
      sender_profile_picture: sender?.profile_picture_url || null,
    }
  })
}

export async function respondToFriendRequest(requestId: string, response: "accepted" | "rejected"): Promise<boolean> {
  const { data: requestData, error: fetchError } = await supabase
    .from("friend_requests")
    .select("sender_id, receiver_id")
    .eq("id", requestId)
    .single()

  if (fetchError) {
    console.error("Error fetching friend request:", fetchError)
    return false
  }

  if (response === "accepted") {
    // Create friendship records
    const { error: insertError } = await supabase.from("friendships").insert([
      { user_id: requestData.sender_id, friend_id: requestData.receiver_id, status: "accepted" },
      { user_id: requestData.receiver_id, friend_id: requestData.sender_id, status: "accepted" },
    ])

    if (insertError) {
      console.error("Error creating friendship:", insertError)
      // If the error is due to RLS, it might mean the friendship already exists
      if (insertError.code === "42501") {
        console.log("Friendship might already exist. Proceeding with request update.")
      } else {
        return false
      }
    }
  }

  // Update the friend request status
  const { error: updateError } = await supabase.from("friend_requests").update({ status: response }).eq("id", requestId)

  if (updateError) {
    console.error("Error updating friend request:", updateError)
    return false
  }

  return true
}

