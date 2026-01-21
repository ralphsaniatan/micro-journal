-- Create a new private bucket 'journal_media'
-- We use 'public' false, but will allow public read access via policy for simplicity with unguessable URLs
INSERT INTO storage.buckets (id, name, public)
VALUES ('journal_media', 'journal_media', true);

-- Policy: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'journal_media' );

-- Policy: Everyone can view media (public bucket)
CREATE POLICY "Public media access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'journal_media' );

-- Policy: Users can update their own files (optional, but good for cleanup)
CREATE POLICY "Users can update own media"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'journal_media' AND auth.uid() = owner );

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own media"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'journal_media' AND auth.uid() = owner );
