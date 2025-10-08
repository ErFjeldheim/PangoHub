-- Create a public bucket for project files
INSERT INTO storage.buckets (id, name, public)
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

-- Enable read/write RLS policies (optional but explicit)
-- 1. Allow anyone to read from this public bucket
CREATE POLICY "Public read access to projects bucket"
ON storage.objects
FOR SELECT
USING (bucket_id = 'projects');

-- 2. Allow authenticated users to upload (write)
CREATE POLICY "Authenticated users can upload to projects bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'projects');

-- 3. Allow admins (your is_admin() function) to delete
CREATE POLICY "Admins can delete from projects bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()) AND bucket_id = 'projects');
