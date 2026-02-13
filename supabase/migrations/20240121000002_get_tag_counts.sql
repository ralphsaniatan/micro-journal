-- Create a function to aggregate tag counts for the authenticated user
CREATE OR REPLACE FUNCTION get_tag_counts()
RETURNS TABLE (tag text, count bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT unnest(tags) as tag, count(*) as count
  FROM entries
  WHERE user_id = auth.uid()
  GROUP BY tag
  ORDER BY count DESC;
$$;
