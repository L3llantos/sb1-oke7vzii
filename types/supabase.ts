export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: {
          id: string
          name: string
          category: string
          strength_xp: number
          endurance_xp: number
          agility_xp: number
          flexibility_xp: number
          speed_xp: number
          reactions_xp: number
          brainpower_xp: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          strength_xp?: number
          endurance_xp?: number
          agility_xp?: number
          flexibility_xp?: number
          speed_xp?: number
          reactions_xp?: number
          brainpower_xp?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          strength_xp?: number
          endurance_xp?: number
          agility_xp?: number
          flexibility_xp?: number
          speed_xp?: number
          reactions_xp?: number
          brainpower_xp?: number
          created_at?: string
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          icon: string
          xp_reward: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          icon: string
          xp_reward?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          icon?: string
          xp_reward?: number
          created_at?: string
        }
      }
      adventure_quests: {
        Row: {
          id: string
          region_id: string
          name: string
          description: string
          objectives: Json
          rewards: Json
          created_at: string
        }
        Insert: {
          id?: string
          region_id: string
          name: string
          description: string
          objectives: Json
          rewards: Json
          created_at?: string
        }
        Update: {
          id?: string
          region_id?: string
          name?: string
          description?: string
          objectives?: Json
          rewards?: Json
          created_at?: string
        }
      }
      adventure_regions: {
        Row: {
          id: string
          name: string
          description: string
          image: string | null
          required_level: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          image?: string | null
          required_level?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          image?: string | null
          required_level?: number
          created_at?: string
        }
      }
      daily_rewards: {
        Row: {
          id: string
          day: number
          xp_reward: number
          gold_reward: number
          special_item_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          day: number
          xp_reward?: number
          gold_reward?: number
          special_item_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          day?: number
          xp_reward?: number
          gold_reward?: number
          special_item_id?: string | null
          created_at?: string
        }
      }
      daily_tasks: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          xp_reward: number
          gold_reward: number
          difficulty: number
          required_value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          xp_reward?: number
          gold_reward?: number
          difficulty?: number
          required_value?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          xp_reward?: number
          gold_reward?: number
          difficulty?: number
          required_value?: number | null
          created_at?: string
        }
      }
      defeated_special_enemies: {
        Row: {
          id: string
          user_id: string
          enemy_id: string
          defeated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          enemy_id: string
          defeated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          enemy_id?: string
          defeated_at?: string
        }
      }
      friend_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: string
          created_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          mood: string
          tags: string[] | null
          xp_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          mood: string
          tags?: string[] | null
          xp_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          mood?: string
          tags?: string[] | null
          xp_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
      levels: {
        Row: {
          level: number
          xp_required: number
          description: string | null
        }
        Insert: {
          level: number
          xp_required: number
          description?: string | null
        }
        Update: {
          level?: number
          xp_required?: number
          description?: string | null
        }
      }
      mindfulness_sessions: {
        Row: {
          id: string
          user_id: string
          session_type: string
          duration: number
          completed: boolean
          xp_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_type: string
          duration: number
          completed?: boolean
          xp_earned?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_type?: string
          duration?: number
          completed?: boolean
          xp_earned?: number
          created_at?: string
        }
      }
      nutrition_entries: {
        Row: {
          id: string
          user_id: string
          meal_type: string
          meal_time: string
          calories: number
          protein: number
          carbs: number
          fat: number
          items: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meal_type: string
          meal_time?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          items?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meal_type?: string
          meal_time?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          items?: Json | null
          created_at?: string
        }
      }
      offline_sync_queue: {
        Row: {
          id: string
          user_id: string
          data_type: string
          data: Json
          synced: boolean
          created_at: string
          synced_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          data_type: string
          data: Json
          synced?: boolean
          created_at?: string
          synced_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          data_type?: string
          data?: Json
          synced?: boolean
          created_at?: string
          synced_at?: string | null
        }
      }
      player_special_items: {
        Row: {
          id: string
          user_id: string
          item_id: string
          acquired_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id: string
          acquired_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_id?: string
          acquired_at?: string
        }
      }
      players: {
        Row: {
          id: string
          auth_id: string | null
          username: string
          level: number
          xp: number
          gold: number
          stats: Json
          inventory: Json
          equipped_avatar: string | null
          equipped_hat: string | null
          equipped_border: string | null
          battle_progress: Json
          profile_picture_url: string | null
          daily_streak: number | null
          last_daily_claim: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          username: string
          level?: number
          xp?: number
          gold?: number
          stats?: Json
          inventory?: Json
          equipped_avatar?: string | null
          equipped_hat?: string | null
          equipped_border?: string | null
          battle_progress?: Json
          profile_picture_url?: string | null
          daily_streak?: number | null
          last_daily_claim?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          username?: string
          level?: number
          xp?: number
          gold?: number
          stats?: Json
          inventory?: Json
          equipped_avatar?: string | null
          equipped_hat?: string | null
          equipped_border?: string | null
          battle_progress?: Json
          profile_picture_url?: string | null
          daily_streak?: number | null
          last_daily_claim?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      special_items: {
        Row: {
          id: string
          name: string
          image: string
          item_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          image: string
          item_type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          image?: string
          item_type?: string
          description?: string | null
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          completed_at?: string
        }
      }
      user_activities: {
        Row: {
          id: string
          user_id: string
          activity_id: string | null
          name: string
          duration: number
          intensity: number
          xp_gained: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_id?: string | null
          name: string
          duration: number
          intensity?: number
          xp_gained: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_id?: string | null
          name?: string
          duration?: number
          intensity?: number
          xp_gained?: Json
          created_at?: string
        }
      }
      user_adventure_progress: {
        Row: {
          id: string
          user_id: string
          region_id: string
          quest_id: string
          progress: Json
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          region_id: string
          quest_id: string
          progress?: Json
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          region_id?: string
          quest_id?: string
          progress?: Json
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_daily_rewards: {
        Row: {
          id: string
          user_id: string
          reward_id: string
          claimed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reward_id: string
          claimed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reward_id?: string
          claimed_at?: string
        }
      }
      user_daily_tasks: {
        Row: {
          id: string
          user_id: string
          task_id: string
          assigned_date: string
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          assigned_date?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          assigned_date?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_special_item: {
        Args: {
          p_user_id: string
          p_item_name: string
        }
        Returns: boolean
      }
      get_level_from_xp: {
        Args: {
          xp_amount: number
        }
        Returns: number
      }
      get_xp_for_next_level: {
        Args: {
          current_xp: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

