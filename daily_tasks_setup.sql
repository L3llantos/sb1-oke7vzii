-- Create daily_tasks table to store all possible tasks
CREATE TABLE daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    gold_reward INTEGER NOT NULL DEFAULT 20,
    difficulty INTEGER NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
    required_value INTEGER DEFAULT NULL, -- For tasks that need a specific value (like duration or intensity)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_daily_tasks table to track assigned tasks for each user
CREATE TABLE user_daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    task_id UUID REFERENCES daily_tasks(id) NOT NULL,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, task_id, assigned_date)
);

-- Add indexes for better performance
CREATE INDEX idx_user_daily_tasks_user_id ON user_daily_tasks(user_id);
CREATE INDEX idx_user_daily_tasks_assigned_date ON user_daily_tasks(assigned_date);
CREATE INDEX idx_daily_tasks_category ON daily_tasks(category);

-- Add RLS policies
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Daily tasks are viewable by everyone" ON daily_tasks
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own daily tasks" ON user_daily_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily tasks" ON user_daily_tasks
    FOR UPDATE USING (auth.uid() = user_id);

