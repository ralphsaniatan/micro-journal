-- Index to allow Index Only Scan for user's entry dates
CREATE INDEX IF NOT EXISTS idx_entries_user_created_at ON public.entries (user_id, created_at);

-- Function to return timestamps as numbers (milliseconds) to reduce payload size
CREATE OR REPLACE FUNCTION get_entry_timestamps()
RETURNS double precision[]
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    array_agg(extract(epoch from created_at) * 1000),
    '{}'::double precision[]
  )
  FROM entries
  WHERE user_id = auth.uid();
$$;
