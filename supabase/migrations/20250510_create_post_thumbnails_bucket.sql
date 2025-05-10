
-- Create a storage bucket for post thumbnails
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-thumbnails', 'Post Thumbnails', true);

-- Allow authenticated users to upload files to the post-thumbnails bucket
CREATE POLICY "Users can upload post thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own post thumbnails
CREATE POLICY "Users can update their own post thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'post-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own post thumbnails
CREATE POLICY "Users can delete their own post thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'post-thumbnails' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public access to read post thumbnails
CREATE POLICY "Public can view post thumbnails"
ON storage.objects
FOR SELECT
USING (bucket_id = 'post-thumbnails');
