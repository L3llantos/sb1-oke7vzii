/*
  # Add Activity XP Function

  1. New Functions
    - `calculate_activity_xp`: Calculates XP for different skills based on activity type and duration
    - `award_activity_xp`: Awards XP to user skills after an activity is logged

  2. New Trigger
    - Automatically awards XP when a new activity is logged
*/

-- Function to calculate XP based on activity type and duration
CREATE OR REPLACE FUNCTION calculate_activity_xp(
  activity_type TEXT,
  duration_minutes INTEGER
)
RETURNS TABLE (
  skill_name TEXT,
  xp_gained INTEGER
) AS $$
BEGIN
  -- Base XP is 10 points per 10 minutes
  -- Different activities affect different skills
  CASE activity_type
    WHEN 'Running' THEN
      RETURN QUERY SELECT 'Speed'::TEXT, (duration_minutes / 10 * 15)::INTEGER
      UNION ALL SELECT 'Endurance'::TEXT, (duration_minutes / 10 * 20)::INTEGER;
      
    WHEN 'Walking' THEN
      RETURN QUERY SELECT 'Endurance'::TEXT, (duration_minutes / 10 * 10)::INTEGER;
      
    WHEN 'Cycling' THEN
      RETURN QUERY SELECT 'Speed'::TEXT, (duration_minutes / 10 * 10)::INTEGER
      UNION ALL SELECT 'Endurance'::TEXT, (duration_minutes / 10 * 15)::INTEGER;
      
    WHEN 'Swimming' THEN
      RETURN QUERY SELECT 'Endurance'::TEXT, (duration_minutes / 10 * 20)::INTEGER
      UNION ALL SELECT 'Strength'::TEXT, (duration_minutes / 10 * 15)::INTEGER;
      
    WHEN 'Weight Training' THEN
      RETURN QUERY SELECT 'Strength'::TEXT, (duration_minutes / 10 * 25)::INTEGER;
      
    WHEN 'Yoga' THEN
      RETURN QUERY SELECT 'Flexibility'::TEXT, (duration_minutes / 10 * 20)::INTEGER
      UNION ALL SELECT 'Brainpower'::TEXT, (duration_minutes / 10 * 10)::INTEGER;
      
    WHEN 'HIIT' THEN
      RETURN QUERY SELECT 'Speed'::TEXT, (duration_minutes / 10 * 15)::INTEGER
      UNION ALL SELECT 'Strength'::TEXT, (duration_minutes / 10 * 15)::INTEGER
      UNION ALL SELECT 'Endurance'::TEXT, (duration_minutes / 10 * 15)::INTEGER;
      
    ELSE
      RETURN QUERY SELECT 'Endurance'::TEXT, (duration_minutes / 10 * 10)::INTEGER;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to award XP to user skills
CREATE OR REPLACE FUNCTION award_activity_xp()
RETURNS TRIGGER AS $$
DECLARE
  xp_row RECORD;
BEGIN
  -- Calculate and award XP for each affected skill
  FOR xp_row IN SELECT * FROM calculate_activity_xp(NEW.activity_type, NEW.duration_minutes)
  LOOP
    -- Update the user's skill level
    UPDATE user_skills
    SET level = level + xp_row.xp_gained
    WHERE user_id = NEW.user_id AND skill_name = xp_row.skill_name;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically award XP when activity is logged
CREATE TRIGGER on_activity_logged
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION award_activity_xp();