-- Add the 'intensity' column to the 'activities' table
ALTER TABLE activities
ADD COLUMN intensity INTEGER;

-- If you want to set a default value (optional)
-- ALTER TABLE activities
-- ADD COLUMN intensity INTEGER DEFAULT 5;

-- If you want to make it a required field (optional)
-- ALTER TABLE activities
-- ADD COLUMN intensity INTEGER NOT NULL DEFAULT 5;

