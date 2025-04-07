-- Ensure equipped item fields can handle both URLs and UUIDs
ALTER TABLE players
ALTER COLUMN equipped_avatar TYPE TEXT,
ALTER COLUMN equipped_hat TYPE TEXT,
ALTER COLUMN equipped_border TYPE TEXT;

-- Add comments to clarify the dual nature of these fields
COMMENT ON COLUMN players.equipped_avatar IS 'Can be a URL for regular items or a special item ID';
COMMENT ON COLUMN players.equipped_hat IS 'Can be a URL for regular items or a special item ID';
COMMENT ON COLUMN players.equipped_border IS 'Can be a URL for regular items or a special item ID';

-- Create an index on the auth_id column if it doesn't exist already
CREATE INDEX IF NOT EXISTS idx_players_auth_id ON players(auth_id);

