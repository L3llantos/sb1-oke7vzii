-- Modify the achievements table to include xp_reward
ALTER TABLE achievements ADD COLUMN xp_reward INTEGER NOT NULL DEFAULT 0;

-- Insert all 70 achievements
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
-- Strength Challenges
('Power Surge', 'Log 45+ minutes of strength training at intensity 6+', 'Strength', 'Dumbbell', 100),
('Heavy Hitter', 'Use kettlebells or resistance bands for 30+ minutes at intensity 7+', 'Strength', 'Dumbbell', 120),
('Bodyweight Beast', 'Complete a session with only bodyweight exercises at intensity 8+', 'Strength', 'Dumbbell', 150),
('Iron Will', 'Log 3+ strength sessions in a week', 'Strength', 'Calendar', 200),
('Unyielding Force', 'Train at intensity 9+ for at least 20 minutes', 'Strength', 'Dumbbell', 180),
('Endless Reps', 'Log a session with 200+ reps across all exercises', 'Strength', 'Repeat', 150),
('Warrior''s Grip', 'Do a session with a focus on grip strength (e.g., deadlifts, pull-ups)', 'Strength', 'Grip', 130),
('Max Effort', 'Increase intensity by +2 compared to last session', 'Strength', 'TrendingUp', 140),
('The Finisher', 'End a session with 5 minutes of burnout reps', 'Strength', 'Flame', 110),
('The Titan''s Path', 'Log 5 total hours of strength training in a month', 'Strength', 'Calendar', 250),

-- Agility Challenges
('Quick Feet', 'Log an agility-based session at intensity 7+', 'Agility', 'Footprints', 100),
('Ladder Master', 'Complete 30+ minutes of footwork or agility ladder drills', 'Agility', 'Stairs', 120),
('Dodge & Weave', 'Log a session with lateral movements (sports, boxing, agility drills)', 'Agility', 'Move', 130),
('Explosive Power', 'Include at least 50 jump-based movements (box jumps, tuck jumps, etc.)', 'Agility', 'Zap', 150),
('Martial Flow', 'Perform a session of martial arts or sport-based agility training', 'Agility', 'Swords', 140),
('Reaction Runner', 'Alternate sprinting and quick stops for 15+ minutes', 'Agility', 'Zap', 160),
('Hop King', 'Do a session focused on single-leg hops and bounds', 'Agility', 'Footprints', 130),
('Speed & Control', 'Log an agility session at intensity 8+', 'Agility', 'Gauge', 170),
('Jumping Spider', 'Reach a new personal best on vertical jump height', 'Agility', 'ArrowUp', 200),
('Footwork Frenzy', 'Complete 3 agility sessions in a week', 'Agility', 'Calendar', 180),

-- Endurance Challenges
('No Limits', 'Log a 60+ minute workout at any intensity', 'Endurance', 'Clock', 100),
('Marathon Mentality', 'Accumulate 5+ hours of cardio in a week', 'Endurance', 'Calendar', 250),
('The Long Haul', 'Log a single session of 90+ minutes', 'Endurance', 'Clock', 200),
('Steady Burn', 'Maintain at least intensity 5 for an entire session', 'Endurance', 'Flame', 150),
('Survivor Mode', 'Do a high-intensity session with no breaks', 'Endurance', 'Zap', 180),
('Heart of a Champion', 'Complete two 45-minute endurance workouts in one day', 'Endurance', 'Heart', 220),
('Never Stop', 'Log an endurance activity for 7 consecutive days', 'Endurance', 'Calendar', 300),
('Climb the Mountain', 'Complete a stair-climbing session of 30+ minutes', 'Endurance', 'Mountain', 160),
('10K Challenge', 'Walk, run, or cycle 10,000 meters in a single session', 'Endurance', 'Route', 200),
('Ultra Training', 'Log a total of 10+ hours of endurance workouts in a month', 'Endurance', 'Calendar', 350),

-- Speed Challenges
('Lightning Sprint', 'Log a session with at least 10 all-out sprints', 'Speed', 'Zap', 150),
('Fastest Lap', 'Record a personal best sprint time over 100m', 'Speed', 'Timer', 200),
('Speed Demon', 'Do a speed-focused session at intensity 8+', 'Speed', 'Gauge', 180),
('Quick Burst', 'Alternate 20s sprint, 40s jog for 15+ minutes', 'Speed', 'Timer', 160),
('Reaction Speed', 'Sprint from a random start signal (friend, app, etc.)', 'Speed', 'Zap', 140),
('Acceleration Test', 'Improve your 10m sprint time', 'Speed', 'TrendingUp', 170),
('Sprint Marathon', 'Run a total of 50 short sprints in a single workout', 'Speed', 'Repeat', 190),
('Reflex Runner', 'Incorporate agility + sprint drills in a single session', 'Speed', 'Zap', 180),
('Speed Booster', 'Complete 3 speed workouts in a week', 'Speed', 'Calendar', 200),
('Blazing Fast', 'Log a workout where your top speed increases by at least 5%', 'Speed', 'TrendingUp', 220),

-- Flexibility Challenges
('Stretch God', 'Log a flexibility session of 30+ minutes', 'Flexibility', 'Yoga', 100),
('Full Split Mastery', 'Work towards or achieve a full split', 'Flexibility', 'Yoga', 250),
('Yoga Flow', 'Complete a yoga session at intensity 6+', 'Flexibility', 'Yoga', 120),
('Total Body Loosen Up', 'Stretch all major muscle groups in one session', 'Flexibility', 'Yoga', 130),
('Backbend Hero', 'Hold a bridge pose for at least 30 seconds', 'Flexibility', 'Yoga', 150),
('Daily Mobility', 'Log 7 days of flexibility work in a row', 'Flexibility', 'Calendar', 200),
('Morning Stretch Ritual', 'Start the day with a 10-minute stretch for a full week', 'Flexibility', 'Sun', 180),
('Flexibility & Strength', 'Combine stretching with strength exercises in a session', 'Flexibility', 'Dumbbell', 160),
('Ultimate Stretch Hold', 'Hold a deep stretch for 60+ seconds', 'Flexibility', 'Clock', 140),
('Elastic Body', 'Log 5 hours of flexibility training in a month', 'Flexibility', 'Calendar', 250),

-- Reaction Challenges
('Reflex Master', 'Log a reaction-based sports session (boxing, dodgeball, tennis)', 'Reaction', 'Zap', 150),
('Speed Hands', 'Perform 100+ quick punches or taps in 30 seconds', 'Reaction', 'Boxing', 180),
('Juggle Challenge', 'Maintain a juggle or ball drill for 60 seconds', 'Reaction', 'CircleDot', 160),
('Flash Reflexes', 'Catch a thrown ball at random intervals', 'Reaction', 'Target', 140),
('Precision & Power', 'Strike or react to 50+ targets in a single session', 'Reaction', 'Target', 170),
('Dodge & Counter', 'Log a martial arts or defensive drill session', 'Reaction', 'Shield', 160),
('Sudden Start', 'Begin a sprint only when a random signal is given', 'Reaction', 'Zap', 150),
('Hand-Eye Champion', 'Perform a coordination drill at intensity 7+', 'Reaction', 'Eye', 180),
('Perfect Timing', 'Play a reaction-based game before/after a workout', 'Reaction', 'Clock', 130),
('Reactive Warrior', 'Log 3 reaction-based sessions in a week', 'Reaction', 'Calendar', 200),

-- Brainpower Challenges
('Mind & Muscle', 'Combine a puzzle or game with a workout', 'Brainpower', 'Brain', 150),
('Think Fast', 'Solve a problem mid-session (riddles, math, memory tasks)', 'Brainpower', 'Brain', 160),
('Memory Sprint', 'Memorize and repeat a sequence while exercising', 'Brainpower', 'Brain', 170),
('Focus Mode', 'Meditate for 10 minutes after a workout', 'Brainpower', 'Brain', 120),
('Multi-Tasker', 'Do a physical and mental task at the same time', 'Brainpower', 'Brain', 180),
('Strategy Session', 'Plan a battle strategy while logging an activity', 'Brainpower', 'Brain', 140),
('Learn & Burn', 'Listen to an educational podcast while training', 'Brainpower', 'Brain', 130),
('Brain Boost', 'Play a reaction-based game before logging a workout', 'Brainpower', 'Brain', 150),
('Endurance Mindset', 'Maintain mental focus during a 60+ min session', 'Brainpower', 'Brain', 200),
('Master of Strategy', 'Unlock a new level of skill through practice', 'Brainpower', 'Brain', 250);

-- Friendships table
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  friend_id UUID REFERENCES auth.users(id),
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, friend_id)
);

-- Add RLS policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships" ON friendships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert friendships" ON friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friendships" ON friendships
  FOR UPDATE USING (auth.uid() = user_id);

