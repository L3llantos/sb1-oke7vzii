-- Insert 50 daily tasks into the daily_tasks table
INSERT INTO daily_tasks (title, description, category, xp_reward, gold_reward, difficulty, required_value) VALUES

-- Activity Logging Tasks - Basic (10)
('Quick Workout', 'Log any activity with at least 10 minutes duration', 'Activity', 40, 15, 1, 10),
('Half Hour Hustle', 'Log any activity with at least 30 minutes duration', 'Activity', 60, 25, 2, 30),
('Endurance Test', 'Log any activity with at least 45 minutes duration', 'Activity', 80, 35, 3, 45),
('Morning Boost', 'Log an activity before 10:00 AM', 'Activity', 50, 20, 1, NULL),
('Evening Wind-Down', 'Log an activity after 6:00 PM', 'Activity', 50, 20, 1, NULL),
('Challenge Yourself', 'Log an activity with intensity 8 or higher', 'Activity', 70, 30, 2, 8),
('Easy Does It', 'Log an activity with intensity between 3-6', 'Activity', 40, 15, 1, NULL),
('Double Effort', 'Log two different activities today', 'Activity', 75, 30, 2, NULL),
('Weekend Warrior', 'Log an activity with at least 20 minutes on a weekend', 'Activity', 55, 25, 1, 20),
('Active Break', 'Log a short 15-minute activity during lunch hours (12-2 PM)', 'Activity', 45, 20, 1, 15),

-- Skill-Specific Tasks (25)
-- Strength (5)
('Strength Builder', 'Log a Strength activity with at least 20 minutes duration', 'Strength', 50, 20, 1, 20),
('Heavy Lifter', 'Log a Strength activity with intensity 7+', 'Strength', 65, 30, 2, 7),
('Strength Endurance', 'Log a Strength activity with at least 40 minutes duration', 'Strength', 75, 35, 2, 40),
('Muscle Marathon', 'Earn at least 100 Strength XP today', 'Strength', 80, 40, 3, 100),
('Power Circuit', 'Log a Weight Training or Bodyweight Exercises activity', 'Strength', 55, 25, 1, NULL),

-- Endurance (5)
('Cardio Starter', 'Log a Cardio activity with at least 15 minutes duration', 'Endurance', 50, 20, 1, 15),
('Distance Runner', 'Log a Cardio activity with at least 30 minutes duration', 'Endurance', 65, 30, 2, 30),
('Endurance Challenge', 'Log a Cardio activity with intensity 8+', 'Endurance', 70, 35, 2, 8),
('Cardio King/Queen', 'Earn at least 100 Endurance XP today', 'Endurance', 80, 40, 3, 100),
('Heart Pumper', 'Log a Running or Cycling activity', 'Endurance', 55, 25, 1, NULL),

-- Flexibility (5)
('Flexibility Focus', 'Log a Flexibility activity with at least 15 minutes duration', 'Flexibility', 50, 20, 1, 15),
('Deep Stretch', 'Log a Flexibility activity with at least 25 minutes duration', 'Flexibility', 60, 25, 2, 25),
('Mindful Movement', 'Log a Yoga or Stretching activity', 'Flexibility', 55, 25, 1, NULL),
('Flexibility Master', 'Earn at least 75 Flexibility XP today', 'Flexibility', 70, 30, 2, 75),
('Bend & Flow', 'Log a Flexibility activity with intensity 6+', 'Flexibility', 65, 30, 2, 6),

-- Agility & Speed (5)
('Quick Feet', 'Log an Agility or Speed focused activity', 'Agility', 55, 25, 1, NULL),
('Speed Demon', 'Log a Speed activity with intensity 7+', 'Speed', 70, 30, 2, 7),
('Agility Circuit', 'Log an Agility activity with at least 20 minutes duration', 'Agility', 60, 25, 2, 20),
('Sprint Challenge', 'Earn at least 80 Speed XP today', 'Speed', 75, 35, 2, 80),
('Quickness Training', 'Log a Sports activity that involves rapid movements', 'Agility', 60, 25, 2, NULL),

-- Brainpower (5)
('Mind Matters', 'Log a Mind & Focus activity with at least 15 minutes duration', 'Brainpower', 50, 20, 1, 15),
('Brain Training', 'Log a Meditation or Chess activity', 'Brainpower', 55, 25, 1, NULL),
('Mental Focus', 'Log a Mind activity with intensity 5+', 'Brainpower', 60, 25, 2, 5),
('Thought Leader', 'Earn at least 70 Brainpower XP today', 'Brainpower', 70, 30, 2, 70),
('Mindful Session', 'Log a 30+ minute Mind & Focus activity', 'Brainpower', 65, 30, 2, 30),

-- Game Progression Tasks (10)
('Monster Hunter', 'Defeat 3 monsters in the Auto Battler', 'Game', 60, 30, 2, 3),
('PvP Champion', 'Win a battle in the PvP Arena', 'Game', 70, 35, 2, NULL),
('Social Butterfly', 'Send a friend request to another player', 'Game', 40, 20, 1, NULL),
('Fashion Forward', 'Change your character's appearance in the customization menu', 'Game', 35, 15, 1, NULL),
('Wave Runner', 'Reach wave 5 in the Auto Battler', 'Game', 75, 40, 3, 5),
('Achievement Hunter', 'Check your achievements page', 'Game', 30, 10, 1, NULL),
('Character Development', 'Reach a new level in any skill', 'Game', 60, 30, 2, NULL),
('Shop Till You Drop', 'Purchase an item from the shop', 'Game', 45, 25, 1, NULL),
('Friendly Competition', 'Challenge a friend in the PvP Arena', 'Game', 50, 25, 2, NULL),
('Level Up', 'Increase your total character level', 'Game', 80, 50, 3, NULL),

-- Special Tasks (5)
('Cross-Training', 'Log activities from two different categories on the same day', 'Special', 70, 35, 2, NULL),
('Try Something New', 'Log an activity you haven\'t done in the last 7 days', 'Special', 65, 30, 2, NULL),
('Balance Master', 'Log activities that improve at least 3 different skills', 'Special', 75, 40, 3, NULL),
('Full Spectrum', 'Log activities that give XP to all 7 skills in one day', 'Special', 100, 50, 3, NULL),
('Consistency Champion', 'Log an activity 3 days in a row', 'Special', 90, 45, 3, NULL);

