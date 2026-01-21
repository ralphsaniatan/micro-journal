-- Drop the old constraint that prevents deletion if children exist
ALTER TABLE entries DROP CONSTRAINT IF EXISTS entries_parent_id_fkey;

-- Re-add with ON DELETE CASCADE
-- This ensures that when a parent post is deleted, all its replies are automatically deleted too.
ALTER TABLE entries 
    ADD CONSTRAINT entries_parent_id_fkey 
    FOREIGN KEY (parent_id) 
    REFERENCES entries(id) 
    ON DELETE CASCADE;
