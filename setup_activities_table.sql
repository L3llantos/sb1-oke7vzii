-- Create the activities table
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    strength_xp INTEGER NOT NULL DEFAULT 0,
    endurance_xp INTEGER NOT NULL DEFAULT 0,
    agility_xp INTEGER NOT NULL DEFAULT 0,
    flexibility_xp INTEGER NOT NULL DEFAULT 0,
    speed_xp INTEGER NOT NULL DEFAULT 0,
    reactions_xp INTEGER NOT NULL DEFAULT 0,
    brainpower_xp INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample activities
INSERT INTO activities (name, category, strength_xp, endurance_xp, agility_xp, flexibility_xp, speed_xp, reactions_xp, brainpower_xp) VALUES
('Weight Training', 'Strength', 10, 3, 1, 1, 1, 1, 1),
('Bodyweight Exercises', 'Strength', 8, 4, 2, 2, 1, 1, 1),
('Resistance Bands', 'Strength', 7, 3, 2, 3, 1, 1, 1),
('Kettlebells', 'Strength', 9, 4, 2, 1, 2, 2, 1),
('Running', 'Cardio', 1, 10, 2, 1, 8, 1, 1),
('Cycling', 'Cardio', 2, 9, 1, 1, 7, 2, 1),
('Swimming', 'Cardio', 3, 8, 2, 3, 6, 1, 1),
('Rowing', 'Cardio', 4, 8, 1, 2, 5, 1, 1),
('Jump Rope', 'Cardio', 2, 7, 5, 1, 6, 3, 1),
('Yoga', 'Flexibility', 2, 3, 3, 10, 1, 2, 5),
('Stretching', 'Flexibility', 1, 1, 2, 10, 1, 1, 2),
('Pilates', 'Flexibility', 3, 4, 3, 8, 2, 2, 3),
('Mobility Work', 'Flexibility', 2, 2, 4, 9, 2, 2, 2),
('Basketball', 'Sports', 3, 7, 8, 2, 7, 8, 3),
('Soccer', 'Sports', 4, 8, 7, 3, 8, 7, 3),
('Tennis', 'Sports', 3, 6, 8, 4, 7, 9, 4),
('Volleyball', 'Sports', 3, 5, 7, 3, 6, 8, 3),
('Martial Arts', 'Sports', 6, 6, 7, 5, 6, 9, 5),
('Meditation', 'Mind', 0, 1, 0, 1, 0, 2, 10),
('Chess', 'Mind', 0, 1, 0, 0, 0, 5, 10),
('Reading', 'Mind', 0, 0, 0, 0, 0, 1, 9),
('Puzzles', 'Mind', 0, 0, 0, 0, 0, 3, 10);

-- Add indexes to improve query performance
CREATE INDEX idx_activities_category ON activities(category);
CREATE INDEX idx_activities_name ON activities(name);

-- Add RLS policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activities are viewable by everyone" ON activities
    FOR SELECT USING (true);

