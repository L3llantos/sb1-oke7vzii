-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS award_special_item(UUID, TEXT);

-- Recreate the function with the correct parameter names
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

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION award_special_item(UUID, TEXT) TO authenticated;

