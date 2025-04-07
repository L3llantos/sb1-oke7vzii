-- First, let's make sure our special_items table exists and has the correct structure
CREATE TABLE IF NOT EXISTS special_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    item_type TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Now, let's insert the special items from the special monsters
INSERT INTO special_items (name, image, item_type, description) VALUES
    ('Ancient Helmet', 'ancient_helmet.png', 'hat', 'A legendary helmet worn by the mightiest warriors of old.'),
    ('Shadow Cloak', 'shadow_cloak.png', 'avatar', 'A mysterious cloak that seems to bend light around its wearer.'),
    ('Mystic Aura', 'mystic_aura.png', 'border', 'A shimmering aura of arcane energy that surrounds your character.'),
    ('Winged Cap', 'winged_cap.png', 'hat', 'A cap with magical wings that seems to make the wearer lighter than air.'),
    ('Iron Skin', 'iron_skin.png', 'avatar', 'Your skin takes on a metallic sheen, making you look nearly invincible.'),
    ('Psychic Waves', 'psychic_waves.png', 'border', 'Rippling waves of mental energy that emanate from your character.'),
    ('Dragon Armor', 'dragon_armor.png', 'avatar', 'Legendary armor forged from the scales of the Dragon King himself.')
ON CONFLICT (name) DO UPDATE
SET image = EXCLUDED.image,
    item_type = EXCLUDED.item_type,
    description = EXCLUDED.description;

-- Let's also add the sample borders we created earlier, if they don't exist
INSERT INTO special_items (name, image, item_type, description) VALUES
    ('Golden Border', 'golden_border.png', 'border', 'A shimmering golden border that exudes wealth and prestige.'),
    ('Diamond Border', 'diamond_border.png', 'border', 'A dazzling border that sparkles like the finest diamonds.'),
    ('Rainbow Border', 'rainbow_border.png', 'border', 'A vibrant, ever-changing border that cycles through all colors of the rainbow.')
ON CONFLICT (name) DO UPDATE
SET image = EXCLUDED.image,
    item_type = EXCLUDED.item_type,
    description = EXCLUDED.description;

-- Add an index on the name for faster lookups
CREATE INDEX IF NOT EXISTS idx_special_items_name ON special_items(name);

-- Ensure RLS is enabled
ALTER TABLE special_items ENABLE ROW LEVEL SECURITY;

-- Recreate the policy to allow all users to view special items
DROP POLICY IF EXISTS "Special items are viewable by everyone" ON special_items;
CREATE POLICY "Special items are viewable by everyone" 
    ON special_items FOR SELECT 
    USING (true);

-- Let's also make sure our player_special_items table is set up correctly
CREATE TABLE IF NOT EXISTS player_special_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    item_id UUID NOT NULL REFERENCES special_items(id),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, item_id)
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_player_special_items_user_id ON player_special_items(user_id);
CREATE INDEX IF NOT EXISTS idx_player_special_items_item_id ON player_special_items(item_id);

-- Ensure RLS is enabled
ALTER TABLE player_special_items ENABLE ROW LEVEL SECURITY;

-- Recreate policies for player_special_items table
DROP POLICY IF EXISTS "Players can view their own special items" ON player_special_items;
CREATE POLICY "Players can view their own special items" 
    ON player_special_items FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Players can insert their own special items" ON player_special_items;
CREATE POLICY "Players can insert their own special items" 
    ON player_special_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Function to award a special item to a player
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

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION award_special_item(UUID, TEXT) TO authenticated;

