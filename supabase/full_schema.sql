-- HireFlow AI — Complete Consolidated PostgreSQL Schema Migration
-- Copy & Run this script in your Supabase Dashboard -> SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    job_title TEXT,
    bio TEXT,
    website TEXT,
    github TEXT,
    linkedin TEXT,
    favorite_templates TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for auto updating profiles.updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function & Trigger to automatically create a profile row when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    target_role TEXT,
    template_name TEXT DEFAULT 'Modern',
    resume_type TEXT NOT NULL DEFAULT 'experienced' CHECK (resume_type IN ('fresher', 'experienced')),
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    original_file_name TEXT,
    file_path TEXT,
    file_type TEXT,
    ats_score INT,
    structure_score INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS update_resumes_updated_at ON public.resumes;
CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON public.resumes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_deleted_at ON public.resumes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_resumes_resume_type ON public.resumes(resume_type);
CREATE INDEX IF NOT EXISTS idx_resumes_ats_score ON public.resumes(ats_score);

-- 3. RESUME SECTIONS TABLE (Normalized storing of sections)
CREATE TABLE IF NOT EXISTS public.resume_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    section_order INT NOT NULL DEFAULT 0,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_resume_sections_updated_at ON public.resume_sections;
CREATE TRIGGER update_resume_sections_updated_at
BEFORE UPDATE ON public.resume_sections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_id ON public.resume_sections(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_sections_type ON public.resume_sections(section_type);

-- 4. RESUME ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.resume_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_activity_user_id ON public.resume_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_activity_created_at ON public.resume_activity(created_at DESC);

-- 5. JOB DESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    jd_text TEXT NOT NULL,
    extracted_keywords TEXT[] DEFAULT '{}',
    required_skills TEXT[] DEFAULT '{}',
    experience_level TEXT,
    industry TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_job_descriptions_updated_at ON public.job_descriptions;
CREATE TRIGGER update_job_descriptions_updated_at
BEFORE UPDATE ON public.job_descriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON public.job_descriptions(user_id);

-- 6. ATS REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.ats_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_description_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    overall_score INT NOT NULL DEFAULT 0,
    formatting_score INT DEFAULT 0,
    keyword_score INT DEFAULT 0,
    grammar_score INT DEFAULT 0,
    star_score INT DEFAULT 0,
    action_verb_score INT DEFAULT 0,
    missing_keywords TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    ai_suggestions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_ats_reports_updated_at ON public.ats_reports;
CREATE TRIGGER update_ats_reports_updated_at
BEFORE UPDATE ON public.ats_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_ats_reports_user_id ON public.ats_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ats_reports_resume_id ON public.ats_reports(resume_id);

-- 7. TAILORED RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.tailored_resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    job_description_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    ats_report_id UUID REFERENCES public.ats_reports(id) ON DELETE SET NULL,
    tailored_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    match_percentage INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_tailored_resumes_updated_at ON public.tailored_resumes;
CREATE TRIGGER update_tailored_resumes_updated_at
BEFORE UPDATE ON public.tailored_resumes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_tailored_resumes_user_id ON public.tailored_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_tailored_resumes_original_id ON public.tailored_resumes(original_resume_id);

-- 8. RESUME VERSIONS TABLE
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    version_name TEXT NOT NULL,
    is_tailored BOOLEAN DEFAULT FALSE,
    original_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_description_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    ats_report_id UUID REFERENCES public.ats_reports(id) ON DELETE SET NULL,
    snapshot_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_resume_versions_updated_at ON public.resume_versions;
CREATE TRIGGER update_resume_versions_updated_at
BEFORE UPDATE ON public.resume_versions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON public.resume_versions(resume_id);

-- 9. AI HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.ai_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    prompt TEXT,
    response JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON public.ai_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_resume_id ON public.ai_history(resume_id);

-- 10. TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    preview_image_url TEXT,
    json_layout JSONB NOT NULL DEFAULT '{}'::jsonb,
    typography JSONB NOT NULL DEFAULT '{}'::jsonb,
    spacing JSONB NOT NULL DEFAULT '{}'::jsonb,
    color_scheme JSONB NOT NULL DEFAULT '{}'::jsonb,
    supported_sections TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- 12. EXPORTS TABLE
CREATE TABLE IF NOT EXISTS public.exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    file_type TEXT NOT NULL,
    file_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON public.exports(user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- Helper to safely drop all existing policies and recreate clean ones
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename, schemaname
        FROM pg_policies
        WHERE schemaname = 'public' 
          AND tablename IN (
            'profiles', 'resumes', 'resume_sections', 'resume_activity',
            'job_descriptions', 'ats_reports', 'tailored_resumes',
            'resume_versions', 'ai_history', 'templates', 'notifications', 'exports'
          )
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;

    -- PROFILES
    CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

    -- RESUMES
    DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
    DROP POLICY IF EXISTS "Users can insert own resumes" ON public.resumes;
    DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
    DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
    CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

    -- RESUME SECTIONS
    DROP POLICY IF EXISTS "Users can view own resume sections" ON public.resume_sections;
    DROP POLICY IF EXISTS "Users can insert own resume sections" ON public.resume_sections;
    DROP POLICY IF EXISTS "Users can update own resume sections" ON public.resume_sections;
    DROP POLICY IF EXISTS "Users can delete own resume sections" ON public.resume_sections;
    CREATE POLICY "Users can view own resume sections" ON public.resume_sections FOR SELECT USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()));
    CREATE POLICY "Users can insert own resume sections" ON public.resume_sections FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()));
    CREATE POLICY "Users can update own resume sections" ON public.resume_sections FOR UPDATE USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()));
    CREATE POLICY "Users can delete own resume sections" ON public.resume_sections FOR DELETE USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()));

    -- RESUME ACTIVITY
    DROP POLICY IF EXISTS "Users can view own activity" ON public.resume_activity;
    DROP POLICY IF EXISTS "Users can insert own activity" ON public.resume_activity;
    DROP POLICY IF EXISTS "Users can delete own activity" ON public.resume_activity;
    CREATE POLICY "Users can view own activity" ON public.resume_activity FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own activity" ON public.resume_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can delete own activity" ON public.resume_activity FOR DELETE USING (auth.uid() = user_id);

    -- JOB DESCRIPTIONS
    DROP POLICY IF EXISTS "Users can manage own job descriptions" ON public.job_descriptions;
    CREATE POLICY "Users can manage own job descriptions" ON public.job_descriptions ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- ATS REPORTS
    DROP POLICY IF EXISTS "Users can manage own ats reports" ON public.ats_reports;
    CREATE POLICY "Users can manage own ats reports" ON public.ats_reports ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- TAILORED RESUMES
    DROP POLICY IF EXISTS "Users can manage own tailored resumes" ON public.tailored_resumes;
    CREATE POLICY "Users can manage own tailored resumes" ON public.tailored_resumes ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- RESUME VERSIONS
    DROP POLICY IF EXISTS "Users can view own resume versions" ON public.resume_versions;
    DROP POLICY IF EXISTS "Users can insert own resume versions" ON public.resume_versions;
    DROP POLICY IF EXISTS "Users can delete own resume versions" ON public.resume_versions;
    CREATE POLICY "Users can view own resume versions" ON public.resume_versions FOR SELECT USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()));
    CREATE POLICY "Users can insert own resume versions" ON public.resume_versions FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()));
    CREATE POLICY "Users can delete own resume versions" ON public.resume_versions FOR DELETE USING (EXISTS (SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()));

    -- AI HISTORY
    DROP POLICY IF EXISTS "Users can manage own ai history" ON public.ai_history;
    CREATE POLICY "Users can manage own ai history" ON public.ai_history ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

    -- TEMPLATES
    DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;
    CREATE POLICY "Anyone can view active templates" ON public.templates FOR SELECT USING (is_active = TRUE);

    -- NOTIFICATIONS
    DROP POLICY IF EXISTS "Users can view and update own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
    DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
    CREATE POLICY "Users can view and update own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

    -- EXPORTS
    DROP POLICY IF EXISTS "Users can manage own exports" ON public.exports;
    CREATE POLICY "Users can manage own exports" ON public.exports ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END $$;

-- ─────────────────────────────────────────────────────────────────────────
-- STORAGE BUCKETS SETUP
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('resumes', 'resumes', false),
    ('exports', 'exports', false),
    ('templates', 'templates', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Users Upload Avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users Update Own Avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users Delete Own Avatar" ON storage.objects;
    CREATE POLICY "Public Read Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
    CREATE POLICY "Authenticated Users Upload Avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
    CREATE POLICY "Users Update Own Avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Users Delete Own Avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

    DROP POLICY IF EXISTS "Users View Own Uploaded Resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Users Upload Resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Users Delete Own Resumes" ON storage.objects;
    CREATE POLICY "Users View Own Uploaded Resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Users Upload Resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Users Delete Own Resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

    DROP POLICY IF EXISTS "Users View Own Exports" ON storage.objects;
    DROP POLICY IF EXISTS "Users Create Own Exports" ON storage.objects;
    CREATE POLICY "Users View Own Exports" ON storage.objects FOR SELECT USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);
    CREATE POLICY "Users Create Own Exports" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

    DROP POLICY IF EXISTS "Public View Templates Assets" ON storage.objects;
    CREATE POLICY "Public View Templates Assets" ON storage.objects FOR SELECT USING (bucket_id = 'templates');
END $$;
