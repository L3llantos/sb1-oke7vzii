-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own daily tasks" ON user_daily_tasks;
DROP POLICY IF EXISTS "Users can update their own daily tasks" ON user_daily_tasks;
DROP POLICY IF EXISTS "Users can insert their own daily tasks" ON user_daily_tasks;

-- Create comprehensive RLS policies for user_daily_tasks
CREATE POLICY "Users can view their own daily tasks" ON user_daily_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tasks" ON user_daily_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily tasks" ON user_daily_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Make sure the daily_tasks table has appropriate policies
DROP POLICY IF EXISTS "Daily tasks are viewable by everyone" ON daily_tasks;

CREATE POLICY "Daily tasks are viewable by everyone" ON daily_tasks
  FOR SELECT USING (true);

-- Verify RLS is enabled on both tables
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tasks ENABLE ROW LEVEL SECURITY;

