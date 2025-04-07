-- Create the special_items table
CREATE TABLE special_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    item_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the player_special_items table
CREATE TABLE player_special_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    item_id UUID NOT NULL REFERENCES special_items(id),
    item_type TEXT NOT NULL,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX idx_player_special_items_user_id ON player_special_items(user_id);
CREATE INDEX idx_player_special_items_item_id ON player_special_items(item_id);
CREATE INDEX idx_player_special_items_item_type ON player_special_items(item_type);

-- Add a unique constraint to prevent duplicate entries
ALTER TABLE player_special_items ADD CONSTRAINT unique_player_item 
    UNIQUE (user_id, item_id);

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE special_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_special_items ENABLE ROW LEVEL SECURITY;

-- Create policies for special_items table
CREATE POLICY "Special items are viewable by everyone" 
    ON special_items FOR SELECT 
    USING (true);

-- Create policies for player_special_items table
CREATE POLICY "Players can view their own special items" 
    ON player_special_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Players can insert their own special items" 
    ON player_special_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Insert some sample special items (borders)
INSERT INTO special_items (name, image, item_type) VALUES
    ('Golden Border', 'golden_border.png', 'border'),
    ('Diamond Border', 'diamond_border.png', 'border'),
    ('Rainbow Border', 'rainbow_border.png', 'border');

-- To add a special item to a player, you would use a query like this:
-- INSERT INTO player_special_items (user_id, item_id, item_type)
-- VALUES ('player-uuid', 'special-item-uuid', 'border');

-- For example (replace 'player-uuid' with an actual user ID):
-- INSERT INTO player_special_items (user_id, item_id, item_type)
-- SELECT 'player-uuid', id, 'border'
-- FROM special_items
-- WHERE name = 'Golden Border';

