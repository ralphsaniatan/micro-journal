-- Create a table for rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 0,
  last_attempt TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (though service_role bypasses it, good practice)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create the rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(key_param TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  window_duration INTERVAL := INTERVAL '1 minute';
  max_attempts INTEGER := 5;
BEGIN
  INSERT INTO public.rate_limits (key, count, last_attempt)
  VALUES (key_param, 1, NOW())
  ON CONFLICT (key)
  DO UPDATE SET
    count = CASE
      WHEN (NOW() - rate_limits.last_attempt) < window_duration THEN rate_limits.count + 1
      ELSE 1
    END,
    last_attempt = NOW()
  RETURNING count INTO current_count;

  IF current_count > max_attempts THEN
    RETURN FALSE;
  ELSE
    RETURN TRUE;
  END IF;
END;
$$;

-- Grant execution permission only to service_role (implicitly done for owner, but explicit helps)
-- We do NOT grant execute to anon or authenticated roles to prevent public abuse.
REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT) TO service_role;
