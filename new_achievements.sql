-- First, let's clear out the old achievements (optional - you can skip this if you want to keep them)
-- DELETE FROM achievements;

-- Insert new achievements for each skill category
-- Each skill has 10 achievements with increasing difficulty

-- STRENGTH ACHIEVEMENTS
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
('Strength Beginner', 'Gain 100 total Strength XP', 'Strength', 'Dumbbell', 50),
('Muscle Starter', 'Complete 5 Strength activities', 'Strength', 'Dumbbell', 100),
('Weight Lifter', 'Log a Strength activity with intensity 7+', 'Strength', 'Dumbbell', 150),
('Strength Builder', 'Gain 500 total Strength XP', 'Strength', 'Dumbbell', 200),
('Consistent Trainer', 'Complete Strength activities on 3 consecutive days', 'Strength', 'Calendar', 250),
('Power Pusher', 'Log a 45+ minute Strength activity', 'Strength', 'Clock', 300),
('Strength Enthusiast', 'Gain 1,000 total Strength XP', 'Strength', 'Dumbbell', 350),
('Intensity Master', 'Complete a Strength activity at intensity 9+', 'Strength', 'Flame', 400),
('Strength Devotee', 'Complete 25 total Strength activities', 'Strength', 'Dumbbell', 450),
('Strength Champion', 'Gain 2,500 total Strength XP', 'Strength', 'Trophy', 500);

-- AGILITY ACHIEVEMENTS
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
('Agility Beginner', 'Gain 100 total Agility XP', 'Agility', 'Zap', 50),
('Quick Starter', 'Complete 5 Agility activities', 'Agility', 'Zap', 100),
('Nimble Mover', 'Log an Agility activity with intensity 7+', 'Agility', 'Zap', 150),
('Agility Builder', 'Gain 500 total Agility XP', 'Agility', 'Zap', 200),
('Consistent Mover', 'Complete Agility activities on 3 consecutive days', 'Agility', 'Calendar', 250),
('Agility Trainer', 'Log a 45+ minute Agility activity', 'Agility', 'Clock', 300),
('Agility Enthusiast', 'Gain 1,000 total Agility XP', 'Agility', 'Zap', 350),
('Agility Master', 'Complete an Agility activity at intensity 9+', 'Agility', 'Flame', 400),
('Agility Devotee', 'Complete 25 total Agility activities', 'Agility', 'Zap', 450),
('Agility Champion', 'Gain 2,500 total Agility XP', 'Agility', 'Trophy', 500);

-- ENDURANCE ACHIEVEMENTS
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
('Endurance Beginner', 'Gain 100 total Endurance XP', 'Endurance', 'Heart', 50),
('Stamina Starter', 'Complete 5 Cardio activities', 'Endurance', 'Heart', 100),
('Distance Mover', 'Log a Cardio activity with intensity 7+', 'Endurance', 'Heart', 150),
('Endurance Builder', 'Gain 500 total Endurance XP', 'Endurance', 'Heart', 200),
('Consistent Runner', 'Complete Cardio activities on 3 consecutive days', 'Endurance', 'Calendar', 250),
('Long Distance', 'Log a 60+ minute Cardio activity', 'Endurance', 'Clock', 300),
('Endurance Enthusiast', 'Gain 1,000 total Endurance XP', 'Endurance', 'Heart', 350),
('Cardio Master', 'Complete a Cardio activity at intensity 9+', 'Endurance', 'Flame', 400),
('Endurance Devotee', 'Complete 25 total Cardio activities', 'Endurance', 'Heart', 450),
('Endurance Champion', 'Gain 2,500 total Endurance XP', 'Endurance', 'Trophy', 500);

-- SPEED ACHIEVEMENTS
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
('Speed Beginner', 'Gain 100 total Speed XP', 'Speed', 'Footprints', 50),
('Quick Starter', 'Complete 5 Speed-focused activities', 'Speed', 'Footprints', 100),
('Fast Mover', 'Log a Speed activity with intensity 7+', 'Speed', 'Footprints', 150),
('Speed Builder', 'Gain 500 total Speed XP', 'Speed', 'Footprints', 200),
('Consistent Speedster', 'Complete Speed activities on 3 consecutive days', 'Speed', 'Calendar', 250),
('Speed Trainer', 'Log a 30+ minute Speed activity', 'Speed', 'Clock', 300),
('Speed Enthusiast', 'Gain 1,000 total Speed XP', 'Speed', 'Footprints', 350),
('Velocity Master', 'Complete a Speed activity at intensity 9+', 'Speed', 'Flame', 400),
('Speed Devotee', 'Complete 25 total Speed activities', 'Speed', 'Footprints', 450),
('Speed Champion', 'Gain 2,500 total Speed XP', 'Speed', 'Trophy', 500);

-- FLEXIBILITY ACHIEVEMENTS
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
('Flexibility Beginner', 'Gain 100 total Flexibility XP', 'Flexibility', 'Activity', 50),
('Stretch Starter', 'Complete 5 Flexibility activities', 'Flexibility', 'Activity', 100),
('Limber Mover', 'Log a Flexibility activity with intensity 6+', 'Flexibility', 'Activity', 150),
('Flexibility Builder', 'Gain 500 total Flexibility XP', 'Flexibility', 'Activity', 200),
('Consistent Stretcher', 'Complete Flexibility activities on 3 consecutive days', 'Flexibility', 'Calendar', 250),
('Deep Stretch', 'Log a 45+ minute Flexibility activity', 'Flexibility', 'Clock', 300),
('Flexibility Enthusiast', 'Gain 1,000 total Flexibility XP', 'Flexibility', 'Activity', 350),
('Flexibility Master', 'Complete a Flexibility activity at intensity 8+', 'Flexibility', 'Flame', 400),
('Flexibility Devotee', 'Complete 25 total Flexibility activities', 'Flexibility', 'Activity', 450),
('Flexibility Champion', 'Gain 2,500 total Flexibility XP', 'Flexibility', 'Trophy', 500);

-- REACTIONS ACHIEVEMENTS
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
('Reactions Beginner', 'Gain 100 total Reactions XP', 'Reaction', 'Zap', 50),
('Reflex Starter', 'Complete 5 Reaction-building activities', 'Reaction', 'Zap', 100),
('Quick Responder', 'Log a Reactions activity with intensity 6+', 'Reaction', 'Zap', 150),
('Reactions Builder', 'Gain 500 total Reactions XP', 'Reaction', 'Zap', 200),
('Consistent Reactor', 'Complete Reactions activities on 3 consecutive days', 'Reaction', 'Calendar', 250),
('Reflex Trainer', 'Log a 30+ minute Reactions activity', 'Reaction', 'Clock', 300),
('Reactions Enthusiast', 'Gain 1,000 total Reactions XP', 'Reaction', 'Zap', 350),
('Reactions Master', 'Complete a Reactions activity at intensity 8+', 'Reaction', 'Flame', 400),
('Reactions Devotee', 'Complete 20 total Reactions activities', 'Reaction', 'Zap', 450),
('Reactions Champion', 'Gain 2,000 total Reactions XP', 'Reaction', 'Trophy', 500);

-- BRAINPOWER ACHIEVEMENTS
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
('Brainpower Beginner', 'Gain 100 total Brainpower XP', 'Brainpower', 'Brain', 50),
('Mind Starter', 'Complete 5 Mind & Focus activities', 'Brainpower', 'Brain', 100),
('Mental Exerciser', 'Log a Brainpower activity with intensity 5+', 'Brainpower', 'Brain', 150),
('Brainpower Builder', 'Gain 500 total Brainpower XP', 'Brainpower', 'Brain', 200),
('Consistent Thinker', 'Complete Brainpower activities on 3 consecutive days', 'Brainpower', 'Calendar', 250),
('Deep Focus', 'Log a 45+ minute Brainpower activity', 'Brainpower', 'Clock', 300),
('Brainpower Enthusiast', 'Gain 1,000 total Brainpower XP', 'Brainpower', 'Brain', 350),
('Mental Master', 'Complete a Brainpower activity at intensity 7+', 'Brainpower', 'Flame', 400),
('Brainpower Devotee', 'Complete 25 total Brainpower activities', 'Brainpower', 'Brain', 450),
('Brainpower Champion', 'Gain 2,500 total Brainpower XP', 'Brainpower', 'Trophy', 500);

