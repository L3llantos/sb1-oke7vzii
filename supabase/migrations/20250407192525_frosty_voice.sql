/*
  # Setup User Record Creation

  1. New Functions
    - `handle_new_user`: Creates default records for new users
      - Creates profile record
      - Creates default skill records

  2. New Triggers
    - Trigger on auth.users to call handle_new_user
    
  3. Security
    - Function executes with security definer rights
*/

-- Create a function to handle new user setup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  default_skills text[] := ARRAY['Strength', 'Agility', 'Endurance', 'Speed', 'Flexibility', 'Reactions', 'Brainpower'];
  skill text;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, username, created_at, updated_at)
  VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1), NOW(), NOW());

  -- Create default skills
  FOREACH skill IN ARRAY default_skills
  LOOP
    INSERT INTO public.user_skills (user_id, skill_name, level)
    VALUES (NEW.id, skill, 1);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure RLS is enabled on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for profile updates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      TO public
      USING (auth.uid() = id);
  END IF;
END $$;