-- HireFlow AI - Storage Buckets Setup (03_storage.sql)

-- Create buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('resumes', 'resumes', false),
    ('exports', 'exports', false),
    ('templates', 'templates', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- STORAGE POLICIES

-- 1. Avatars Bucket Policies
CREATE POLICY "Public Read Avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated Users Upload Avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users Update Own Avatar"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users Delete Own Avatar"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 2. Resumes Bucket Policies (Private, User-owned)
CREATE POLICY "Users View Own Uploaded Resumes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users Upload Resumes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users Delete Own Resumes"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Exports Bucket Policies (Private, User-owned)
CREATE POLICY "Users View Own Exports"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users Create Own Exports"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Templates Bucket Policies (Public Read)
CREATE POLICY "Public View Templates Assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'templates');
