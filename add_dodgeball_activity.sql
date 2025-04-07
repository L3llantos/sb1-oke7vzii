-- Check if Dodgeball already exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM activities WHERE name = 'Dodgeball') THEN
    -- Add Dodgeball to the activities table
    INSERT INTO activities (name, category, strength_xp, endurance_xp, agility_xp, flexibility_xp, speed_xp, reactions_xp, brainpower_xp) 
    VALUES ('Dodgeball', 'Sports', 3, 6, 8, 3, 7, 9, 4);
  END IF;
END
$$;

