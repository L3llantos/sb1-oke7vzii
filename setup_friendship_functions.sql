-- Function to delete a friendship by ID
CREATE OR REPLACE FUNCTION delete_friendship_by_id(record_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM friendships WHERE id = record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find all friendships between two users
CREATE OR REPLACE FUNCTION find_all_friendships_between_users(user_id_1 UUID, user_id_2 UUID)
RETURNS SETOF friendships AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM friendships
  WHERE (user_id = user_id_1 AND friend_id = user_id_2)
     OR (user_id = user_id_2 AND friend_id = user_id_1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to execute a raw DELETE statement
CREATE OR REPLACE FUNCTION execute_raw_delete(table_name TEXT, record_id UUID)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('DELETE FROM %I WHERE id = %L', table_name, record_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create the delete_friendship_by_id function
CREATE OR REPLACE FUNCTION create_delete_friendship_function()
RETURNS VOID AS $$
BEGIN
  DROP FUNCTION IF EXISTS delete_friendship_by_id(UUID);
  
  EXECUTE '
  CREATE OR REPLACE FUNCTION delete_friendship_by_id(record_id UUID)
  RETURNS VOID AS $$
  BEGIN
    DELETE FROM friendships WHERE id = record_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create the find_all_friendships_between_users function
CREATE OR REPLACE FUNCTION create_find_friendships_function()
RETURNS VOID AS $$
BEGIN
  DROP FUNCTION IF EXISTS find_all_friendships_between_users(UUID, UUID);
  
  EXECUTE '
  CREATE OR REPLACE FUNCTION find_all_friendships_between_users(user_id_1 UUID, user_id_2 UUID)
  RETURNS SETOF friendships AS $$
  BEGIN
    RETURN QUERY
    SELECT * FROM friendships
    WHERE (user_id = user_id_1 AND friend_id = user_id_2)
       OR (user_id = user_id_2 AND friend_id = user_id_1);
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

