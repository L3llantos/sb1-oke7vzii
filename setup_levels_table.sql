-- Create a table to store level thresholds
CREATE TABLE IF NOT EXISTS levels (
  level INTEGER PRIMARY KEY,
  xp_required INTEGER NOT NULL,
  description TEXT
);

-- Insert level thresholds
INSERT INTO levels (level, xp_required, description) VALUES
(1, 0, 'Beginner'),
(2, 100, 'Novice'),
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_levels_xp_required ON levels(xp_required);

-- Add a function to get level from XP
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

-- Add a function to get XP needed for next level
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

