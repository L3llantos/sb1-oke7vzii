-- Create table to track which special enemies each player has defeated
CREATE TABLE IF NOT EXISTS defeated_special_enemies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  enemy_id TEXT NOT NULL,
  defeated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, enemy_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_defeated_special_enemies_user_id ON defeated_special_enemies(user_id);
CREATE INDEX IF NOT EXISTS idx_defeated_special_enemies_enemy_id ON defeated_special_enemies(enemy_id);

-- Add RLS policies
ALTER TABLE defeated_special_enemies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own defeated enemies" ON defeated_special_enemies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own defeated enemies" ON defeated_special_enemies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

