-- Update the player_special_items table to reference the players table
ALTER TABLE player_special_items
DROP CONSTRAINT player_special_items_user_id_fkey,
ADD CONSTRAINT player_special_items_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES players(id)
  ON DELETE CASCADE;

-- Update the RLS policies
DROP POLICY IF EXISTS "Players can view their own special items" ON player_special_items;
CREATE POLICY "Players can view their own special items" 
    ON player_special_items FOR SELECT 
    USING (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

DROP POLICY IF EXISTS "Players can insert their own special items" ON player_special_items;
CREATE POLICY "Players can insert their own special items" 
    ON player_special_items FOR INSERT 
    WITH CHECK (auth.uid() = (SELECT auth_id FROM players WHERE id = user_id));

-- Update the award_special_item function
CREATE OR REPLACE FUNCTION award_special_item(p_player_id UUID, p_item_name TEXT)
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
    VALUES (p_player_id, v_item_id, v_item_type)
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

