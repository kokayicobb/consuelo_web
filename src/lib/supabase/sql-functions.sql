-- This function allows executing SQL queries from server actions
-- It should be created in your Supabase SQL editor

CREATE OR REPLACE FUNCTION execute_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- This runs with the privileges of the function creator
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Execute the query and convert the result to JSON
  EXECUTE 'SELECT to_jsonb(array_agg(row_to_json(t))) FROM (' || query || ') t' INTO result;
  
  -- Handle case where no rows are returned
  IF result IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM,
      'detail', SQLSTATE
    );
END;
$$;

-- Add a policy to restrict this function to authenticated users if needed
-- ALTER FUNCTION execute_sql(text) SECURITY DEFINER;

-- Example usage:
-- SELECT * FROM execute_sql('SELECT * FROM "otf-clients" LIMIT 5');

-- IMPORTANT: For production, you should add more restrictions to prevent SQL injection
-- and restrict what tables/operations can be accessed through this function.