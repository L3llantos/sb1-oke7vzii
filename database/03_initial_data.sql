-- Insert level data
INSERT INTO levels (level, xp_required, description) VALUES
(1, 0, 'Novice'),
(2, 100, 'Beginner'),
(3, 300, 'Apprentice'),
(4, 600, 'Adept'),
(5, 1000, 'Skilled'),
(6, 1500, 'Proficient'),
(7, 2100, 'Expert'),
(8, 2800, 'Master'),
(9, 3600, 'Grandmaster'),
(10, 4500, 'Champion'),
(11, 5500, 'Hero'),
(12, 6600, 'Legend'),
(13, 7800, 'Mythic'),
(14, 9100, 'Godlike'),
(15, 10500, 'Transcendent'),
(16, 12000, 'Ascendant'),
(17, 13600, 'Immortal'),
(18, 15300, 'Divine'),
(19, 17100, 'Celestial'),
(20, 19000, 'Cosmic'),
(21, 21000, 'Universal'),
(22, 23100, 'Infinite'),
(23, 25300, 'Eternal'),
(24, 27600, 'Timeless'),
(25, 30000, 'Ancient'),
(26, 32500, 'Primordial'),
(27, 35100, 'Primeval'),
(28, 37800, 'Archaic'),
(29, 40600, 'Venerable'),
(30, 43500, 'Exalted'),
(31, 46500, 'Sovereign'),
(32, 49600, 'Imperial'),
(33, 52800, 'Majestic'),
(34, 56100, 'Magnificent'),
(35, 59500, 'Glorious'),
(36, 63000, 'Illustrious'),
(37, 66600, 'Renowned'),
(38, 70300, 'Fabled'),
(39, 74100, 'Mythical'),
(40, 78000, 'Legendary'),
(41, 82000, 'Paragon'),
(42, 86100, 'Transcendent'),
(43, 90300, 'Ethereal'),
(44, 94600, 'Astral'),
(45, 99000, 'Celestial'),
(46, 103500, 'Empyrean'),
(47, 108100, 'Divine'),
(48, 112800, 'Godly'),
(49, 117600, 'Omnipotent'),
(50, 122500, 'Ultimate');

-- Insert activity definitions
INSERT INTO activities (name, category, strength_xp, endurance_xp, agility_xp, flexibility_xp, speed_xp, reactions_xp, brainpower_xp) VALUES
-- Strength activities
('Weight Training', 'Strength', 10, 3, 1, 1, 1, 1, 1),
('Bodyweight Exercises', 'Strength', 8, 4, 2, 2, 1, 1, 1),
('Resistance Bands', 'Strength', 7, 3, 2, 3, 1, 1, 1),
('Kettlebells', 'Strength', 9, 4, 2, 1, 2, 2, 1),
('Powerlifting', 'Strength', 10, 4, 1, 2, 2, 2, 2),
('CrossFit', 'Strength', 8, 7, 5, 3, 5, 3, 3),

-- Cardio activities
('Running', 'Cardio', 1, 10, 2, 1, 8, 1, 1),
('Cycling', 'Cardio', 2, 9, 1, 1, 7, 2, 1),
('Swimming', 'Cardio', 3, 8, 2, 3, 6, 1, 1),
('Rowing', 'Cardio', 4, 8, 1, 2, 5, 1, 1),
('Jump Rope', 'Cardio', 2, 7, 5, 1, 6, 3, 1),
('HIIT', 'Cardio', 5, 9, 4, 2, 7, 3, 2),

-- Flexibility activities
('Yoga', 'Flexibility', 2, 3, 3, 10, 1, 2, 5),
('Stretching', 'Flexibility', 1, 1, 2, 10, 1, 1, 2),
('Pilates', 'Flexibility', 3, 4, 3, 8, 2, 2, 3),
('Mobility Work', 'Flexibility', 2, 2, 4, 9, 2, 2, 2),
('Tai Chi', 'Flexibility', 2, 2, 3, 9, 2, 4, 7),
('Ballet', 'Flexibility', 5, 5, 6, 9, 5, 4, 4),

-- Sports activities
('Basketball', 'Sports', 3, 7, 8, 2, 7, 8, 3),
('Soccer', 'Sports', 4, 8, 7, 3, 8, 7, 3),
('Tennis', 'Sports', 3, 6, 8, 4, 7, 9, 4),
('Volleyball', 'Sports', 3, 5, 7, 3, 6, 8, 3),
('Martial Arts', 'Sports', 6, 6, 7, 5, 6, 9, 5),
('Dodgeball', 'Sports', 3, 6, 8, 3, 7, 9, 4),

-- Mind activities
('Meditation', 'Mind', 0, 1, 0, 1, 0, 2, 10),
('Chess', 'Mind', 0, 1, 0, 0, 0, 5, 10),
('Reading', 'Mind', 0, 0, 0, 0, 0, 1, 9),
('Puzzles', 'Mind', 0, 0, 0, 0, 0, 3, 10),
('Breathwork', 'Mind', 0, 2, 0, 2, 0, 2, 9),
('Brain Games', 'Mind', 0, 0, 0, 0, 0, 6, 10);

-- Insert achievements
INSERT INTO achievements (name, description, category, icon, xp_reward) VALUES
-- Strength achievements
('Strength Beginner', 'Gain 100 total Strength XP', 'Strength', 'Dumbbell', 50),
('Muscle Starter', 'Complete 5 Strength activities', 'Strength', 'Dumbbell', 100),
('Weight Lifter', 'Log a Strength activity with intensity 7+', 'Strength', 'Dumbbell', 150),
('Strength Builder', 'Gain 500 total Strength XP', 'Strength', 'Dumbbell', 200),
('Consistent Trainer', 'Complete Strength activities on 3 consecutive days', 'Strength', 'Calendar', 250),

-- Endurance achievements
('Endurance Beginner', 'Gain 100 total Endurance XP', 'Endurance', 'Heart', 50),
('Stamina Starter', 'Complete 5 Cardio activities', 'Endurance', 'Heart', 100),
('Distance Mover', 'Log a Cardio activity with intensity 7+', 'Endurance', 'Heart', 150),
('Endurance Builder', 'Gain 500 total Endurance XP', 'Endurance', 'Heart', 200),
('Consistent Runner', 'Complete Cardio activities on 3 consecutive days', 'Endurance', 'Calendar', 250),

-- Flexibility achievements
('Flexibility Beginner', 'Gain 100 total Flexibility XP', 'Flexibility', 'Activity', 50),
('Stretch Starter', 'Complete 5 Flexibility activities', 'Flexibility', 'Activity', 100),
('Limber Mover', 'Log a Flexibility activity with intensity 6+', 'Flexibility', 'Activity', 150),
('Flexibility Builder', 'Gain 500 total Flexibility XP', 'Flexibility', 'Activity', 200),
('Consistent Stretcher', 'Complete Flexibility activities on 3 consecutive days', 'Flexibility', 'Calendar', 250),

-- General achievements
('First Steps', 'Complete your first activity', 'General', 'Footprints', 50),
('Dedicated Athlete', 'Log activities for 7 consecutive days', 'General', 'Calendar', 300),
('Balanced Warrior', 'Have all skills at level 5 or higher', 'General', 'Trophy', 500),
('Explorer', 'Try 10 different types of activities', 'General', 'Compass  'General', 'Trophy', 500),
('Explorer', 'Try 10 different types of activities', 'General', 'Compass', 200),
('Fitness Enthusiast', 'Log 50 total activities', 'General', 'Award', 400),
('Master of All', 'Reach level 10 in all skills', 'General', 'Crown', 1000);

-- Insert daily tasks
INSERT INTO daily_tasks (title, description, category, xp_reward, gold_reward, difficulty, required_value) VALUES
-- Activity Logging Tasks
('Quick Workout', 'Log any activity with at least 10 minutes duration', 'Activity', 40, 15, 1, 10),
('Half Hour Hustle', 'Log any activity with at least 30 minutes duration', 'Activity', 60, 25, 2, 30),
('Endurance Test', 'Log any activity with at least 45 minutes duration', 'Activity', 80, 35, 3, 45),
('Morning Boost', 'Log an activity before 10:00 AM', 'Activity', 50, 20, 1, NULL),
('Evening Wind-Down', 'Log an activity after 6:00 PM', 'Activity', 50, 20, 1, NULL),
('Challenge Yourself', 'Log an activity with intensity 8 or higher', 'Activity', 70, 30, 2, 8),
('Easy Does It', 'Log an activity with intensity between 3-6', 'Activity', 40, 15, 1, NULL),
('Double Effort', 'Log two different activities today', 'Activity', 75, 30, 2, NULL),

-- Skill-Specific Tasks
('Strength Builder', 'Log a Strength activity with at least 20 minutes duration', 'Strength', 50, 20, 1, 20),
('Heavy Lifter', 'Log a Strength activity with intensity 7+', 'Strength', 65, 30, 2, 7),
('Cardio Starter', 'Log a Cardio activity with at least 15 minutes duration', 'Endurance', 50, 20, 1, 15),
('Distance Runner', 'Log a Cardio activity with at least 30 minutes duration', 'Endurance', 65, 30, 2, 30),
('Flexibility Focus', 'Log a Flexibility activity with at least 15 minutes duration', 'Flexibility', 50, 20, 1, 15),
('Deep Stretch', 'Log a Flexibility activity with at least 25 minutes duration', 'Flexibility', 60, 25, 2, 25),
('Mind Matters', 'Log a Mind & Focus activity with at least 15 minutes duration', 'Brainpower', 50, 20, 1, 15),
('Brain Training', 'Log a Meditation or Chess activity', 'Brainpower', 55, 25, 1, NULL);

-- Insert special items
INSERT INTO special_items (name, image, item_type, description) VALUES
('Ancient Helmet', 'ancient_helmet.png', 'hat', 'A legendary helmet worn by the mightiest warriors of old.'),
('Shadow Cloak', 'shadow_cloak.png', 'avatar', 'A mysterious cloak that seems to bend light around its wearer.'),
('Mystic Aura', 'mystic_aura.png', 'border', 'A shimmering aura of arcane energy that surrounds your character.'),
('Winged Cap', 'winged_cap.png', 'hat', 'A cap with magical wings that seems to make the wearer lighter than air.'),
('Iron Skin', 'iron_skin.png', 'avatar', 'Your skin takes on a metallic sheen, making you look nearly invincible.'),
('Psychic Waves', 'psychic_waves.png', 'border', 'Rippling waves of mental energy that emanate from your character.'),
('Dragon Armor', 'dragon_armor.png', 'avatar', 'Legendary armor forged from the scales of the Dragon King himself.'),
('Golden Border', 'golden_border.png', 'border', 'A shimmering golden border that exudes wealth and prestige.'),
('Diamond Border', 'diamond_border.png', 'border', 'A dazzling border that sparkles like the finest diamonds.'),
('Rainbow Border', 'rainbow_border.png', 'border', 'A vibrant, ever-changing border that cycles through all colors of the rainbow.');

-- Insert daily rewards
INSERT INTO daily_rewards (day, xp_reward, gold_reward) VALUES
(1, 50, 25),
(2, 75, 50),
(3, 100, 75),
(4, 125, 100),
(5, 150, 125),
(6, 175, 150),
(7, 300, 300);

-- Insert adventure regions
INSERT INTO adventure_regions (name, description, image, required_level) VALUES
('Forest Trails', 'A peaceful woodland with gentle paths perfect for beginners.', 'forest_trails.png', 1),
('Coastal Route', 'Beautiful seaside paths with refreshing ocean breezes.', 'coastal_route.png', 5),
('Mountain Pass', 'Challenging terrain with breathtaking views at the summit.', 'mountain_pass.png', 10),
('Ancient Ruins', 'Mysterious structures from a forgotten civilization.', 'ancient_ruins.png', 15),
('Enchanted Valley', 'A magical place where reality seems to bend.', 'enchanted_valley.png', 20),
('Dragon''s Lair', 'The ultimate challenge for only the most dedicated adventurers.', 'dragons_lair.png', 25);

-- Insert adventure quests for Forest Trails
INSERT INTO adventure_quests (region_id, name, description, objectives, rewards) VALUES
((SELECT id FROM adventure_regions WHERE name = 'Forest Trails'), 
'Forest Exploration', 
'Explore the forest paths and discover hidden treasures.', 
'{"type": "exploration", "targets": ["forest_clearing", "ancient_tree", "hidden_cave"], "progress": 0}',
'{"xp": 100, "gold": 50, "items": []}'),

((SELECT id FROM adventure_regions WHERE name = 'Forest Trails'), 
'Goblin Hunt', 
'Eliminate the goblin threat in the forest.', 
'{"type": "combat", "targets": [{"name": "forest_goblin", "count": 5}], "progress": 0}',
'{"xp": 150, "gold": 75, "items": []}'),

((SELECT id FROM adventure_regions WHERE name = 'Forest Trails'), 
'Herb Collection', 
'Collect rare herbs for the village healer.', 
'{"type": "collection", "targets": [{"name": "healing_herb", "count": 10}, {"name": "magic_mushroom", "count": 5}], "progress": 0}',
'{"xp": 120, "gold": 60, "items": []}');

-- Create helper functions
CREATE OR REPLACE FUNCTION award_special_item(p_user_id UUID, p_item_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_item_id UUID;
BEGIN
  -- Get the item ID
  SELECT id INTO v_item_id FROM special_items WHERE name = p_item_name;
  
  IF v_item_id IS NULL THEN
      RAISE EXCEPTION 'Special item not found: %', p_item_name;
  END IF;

  -- Insert the item for the player, ignore if already exists
  INSERT INTO player_special_items (user_id, item_id)
  VALUES (p_user_id, v_item_id)
  ON CONFLICT (user_id, item_id) DO NOTHING;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
      RAISE NOTICE 'Error awarding special item: %', SQLERRM;
      RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get level from XP
CREATE OR REPLACE FUNCTION get_level_from_xp(xp_amount INTEGER) 
RETURNS INTEGER AS $$
DECLARE
  level_val INTEGER;
BEGIN
  SELECT level INTO level_val
  FROM levels
  WHERE xp_required <= xp_amount
  ORDER BY xp_required DESC
  LIMIT 1;
  
  RETURN COALESCE(level_val, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to get XP needed for next level
CREATE OR REPLACE FUNCTION get_xp_for_next_level(current_xp INTEGER) 
RETURNS INTEGER AS $$
DECLARE
  next_xp INTEGER;
BEGIN
  SELECT xp_required INTO next_xp
  FROM levels
  WHERE xp_required > current_xp
  ORDER BY xp_required ASC
  LIMIT 1;
  
  RETURN COALESCE(next_xp, current_xp);
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update player level when XP changes
CREATE OR REPLACE FUNCTION update_player_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level = get_level_from_xp(NEW.xp);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_level_trigger
BEFORE UPDATE OF xp ON players
FOR EACH ROW
EXECUTE FUNCTION update_player_level();

