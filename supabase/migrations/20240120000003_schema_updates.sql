-- Add tags column for array filtering
ALTER TABLE entries ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add updated_at for tracking edits
ALTER TABLE entries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for fast array searches
CREATE INDEX IF NOT EXISTS entries_tags_idx ON entries USING GIN (tags);
