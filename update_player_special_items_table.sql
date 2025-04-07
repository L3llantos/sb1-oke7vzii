-- Alter the player_special_items table to add the item_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'player_special_items' AND column_name = 'item_type') THEN
        ALTER TABLE player_special_items ADD COLUMN item_type TEXT;
        
        -- Update existing rows to set item_type based on the special_items table
        UPDATE player_special_items
        SET item_type = special_items.item_type
        FROM special_items
        WHERE player_special_items.item_id = special_items.id;
        
        -- Make item_type NOT NULL after updating existing rows
        ALTER TABLE player_special_items ALTER COLUMN item_type SET NOT NULL;
    END IF;
END $$;

-- Recreate the index on item_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_player_special_items_item_type ON player_special_items(item_type);

-- Update the award_special_item function to include item_type
CREATE OR REPLACE FUNCTION award_special_item(p_user_id UUID, p_item_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_item_id UUID;
    v_item_type TEXT;
BEGIN
    -- Get the item ID and type
    SELECT id, item_type INTO v_item_id, v_item_type FROM special_items WHERE name = p_item_name;
    
    IF v_item_id IS NULL THEN
        RAISE EXCEPTION 'Special item not found: %', p_item_name;
    END IF;

    -- Insert the item for the player, ignore if already exists
    INSERT INTO player_special_items (user_id, item_id, item_type)
    VALUES (p_user_id, v_item_id, v_item_type)
    ON CONFLICT (user_id, item_id) DO NOTHING;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error awarding special item: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

