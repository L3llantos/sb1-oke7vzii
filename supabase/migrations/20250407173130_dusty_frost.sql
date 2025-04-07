/*
  # Create User Skills Table

  1. New Tables
    - `user_skills`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `skill_name` (text)
      - `level` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_skills` table
    - Add policies for authenticated users to:
      - Read their own skills
      - Update their own skills
*/

CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  skill_name text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own skills
CREATE POLICY "Users can read own skills"
  ON user_skills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to update their own skills
CREATE POLICY "Users can update own skills"
  ON user_skills
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to insert their own skills
CREATE POLICY "Users can insert own skills"
  ON user_skills
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_skills_updated_at
  BEFORE UPDATE ON user_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();