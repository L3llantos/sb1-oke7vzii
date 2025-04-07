-- Enable Row Level Security on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_special_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE defeated_special_enemies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindfulness_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_adventure_progress ENABLE ROW LEVEL SECURITY;

-- Public tables (read-only for everyone)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_quests ENABLE ROW LEVEL SECURITY;

-- Players table policies
CREATE POLICY "Users can view their own player data" 
  ON players FOR SELECT 
  USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own player data" 
  ON players FOR UPDATE 
  USING (auth.uid() = auth_id);

-- Allow viewing other players' basic info (for social features)
CREATE POLICY "Users can view other players' basic info" 
  ON players FOR SELECT 
  USING (true);

-- User activities policies
CREATE POLICY "Users can view their own activities" 
  ON user_activities FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own activities" 
  ON user_activities FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can update their own activities" 
  ON user_activities FOR UPDATE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can delete their own activities" 
  ON user_activities FOR DELETE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- User achievements policies
CREATE POLICY "Users can view their own achievements" 
  ON user_achievements FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own achievements" 
  ON user_achievements FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Friendships policies
CREATE POLICY "Users can view their own friendships" 
  ON friendships FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id) OR 
         auth.uid() = (SELECT auth_id FROM players WHERE id = friend_id));

CREATE POLICY "Users can insert their own friendships" 
  ON friendships FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can update their own friendships" 
  ON friendships FOR UPDATE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id) OR 
         auth.uid() = (SELECT auth_id FROM players WHERE id = friend_id));

-- Friend requests policies
CREATE POLICY "Users can view their own friend requests" 
  ON friend_requests FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = sender_id) OR 
         auth.uid() = (SELECT auth_id FROM players WHERE id = receiver_id));

CREATE POLICY "Users can insert their own friend requests" 
  ON friend_requests FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = sender_id));

CREATE POLICY "Users can update their own friend requests" 
  ON friend_requests FOR UPDATE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = sender_id) OR 
         auth.uid() = (SELECT auth_id FROM players WHERE id = receiver_id));

-- User daily tasks policies
CREATE POLICY "Users can view their own daily tasks" 
  ON user_daily_tasks FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own daily tasks" 
  ON user_daily_tasks FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can update their own daily tasks" 
  ON user_daily_tasks FOR UPDATE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Player special items policies
CREATE POLICY "Users can view their own special items" 
  ON player_special_items FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own special items" 
  ON player_special_items FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Defeated special enemies policies
CREATE POLICY "Users can view their own defeated enemies" 
  ON defeated_special_enemies FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own defeated enemies" 
  ON defeated_special_enemies FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- User daily rewards policies
CREATE POLICY "Users can view their own daily rewards" 
  ON user_daily_rewards FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own daily rewards" 
  ON user_daily_rewards FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Offline sync queue policies
CREATE POLICY "Users can view their own offline sync data" 
  ON offline_sync_queue FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own offline sync data" 
  ON offline_sync_queue FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can update their own offline sync data" 
  ON offline_sync_queue FOR UPDATE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" 
  ON journal_entries FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own journal entries" 
  ON journal_entries FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can update their own journal entries" 
  ON journal_entries FOR UPDATE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can delete their own journal entries" 
  ON journal_entries FOR DELETE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Nutrition entries policies
CREATE POLICY "Users can view their own nutrition entries" 
  ON nutrition_entries FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own nutrition entries" 
  ON nutrition_entries FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can update their own nutrition entries" 
  ON nutrition_entries FOR UPDATE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can delete their own nutrition entries" 
  ON nutrition_entries FOR DELETE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Mindfulness sessions policies
CREATE POLICY "Users can view their own mindfulness sessions" 
  ON mindfulness_sessions FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own mindfulness sessions" 
  ON mindfulness_sessions FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- User adventure progress policies
CREATE POLICY "Users can view their own adventure progress" 
  ON user_adventure_progress FOR SELECT 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can insert their own adventure progress" 
  ON user_adventure_progress FOR INSERT 
  WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

CREATE POLICY "Users can update their own adventure progress" 
  ON user_adventure_progress FOR UPDATE 
  USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Public tables policies (read-only)
CREATE POLICY "Activities are viewable by everyone" 
  ON activities FOR SELECT 
  USING (true);

CREATE POLICY "Achievements are viewable by everyone" 
  ON achievements FOR SELECT 
  USING (true);

CREATE POLICY "Daily tasks are viewable by everyone" 
  ON daily_tasks FOR SELECT 
  USING (true);

CREATE POLICY "Special items are viewable by everyone" 
  ON special_items FOR SELECT 
  USING (true);

CREATE POLICY "Levels are viewable by everyone" 
  ON levels FOR SELECT 
  USING (true);

CREATE POLICY "Daily rewards are viewable by everyone" 
  ON daily_rewards FOR SELECT 
  USING (true);

CREATE POLICY "Adventure regions are viewable by everyone" 
  ON adventure_regions FOR SELECT 
  USING (true);

CREATE POLICY "Adventure quests are viewable by everyone" 
  ON adventure_quests FOR SELECT 
  USING (true);

