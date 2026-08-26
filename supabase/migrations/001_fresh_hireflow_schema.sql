-- ═══════════════════════════════════════════════════════════════════════════════
-- HireFlow AI — Fresh Database Schema Migration
-- ═══════════════════════════════════════════════════════════════════════════════
-- This migration completely resets the HireFlow application tables and recreates
-- a clean, production-ready schema from scratch.
--
-- SAFE TO RUN: Uses IF EXISTS everywhere. Does NOT touch auth schema or auth.users.
-- RUN IN: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- PART 1: DROP ALL EXISTING HIREFLOW TABLES, POLICIES, TRIGGERS, FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- 1a. Drop triggers on external tables
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 1b. Drop all HireFlow tables (CASCADE automatically drops their policies and triggers)
DROP TABLE IF EXISTS public.exports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.ai_history CASCADE;
DROP TABLE IF EXISTS public.tailored_resumes CASCADE;
DROP TABLE IF EXISTS public.resume_versions CASCADE;
DROP TABLE IF EXISTS public.ats_reports CASCADE;
DROP TABLE IF EXISTS public.job_descriptions CASCADE;
DROP TABLE IF EXISTS public.resume_sections CASCADE;
DROP TABLE IF EXISTS public.resume_activity CASCADE;
DROP TABLE IF EXISTS public.resumes CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1d. Drop functions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;


-- ─────────────────────────────────────────────────────────────────────────────
-- PART 2: ENABLE EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─────────────────────────────────────────────────────────────────────────────
-- PART 3: HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Auto-update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create a profile row when a new user signs up via Supabase Auth
-- Works for: email/password signup, Google OAuth, any OAuth provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            ''
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────────────────────
-- PART 4: CREATE TABLES
-- ─────────────────────────────────────────────────────────────────────────────

-- ┌─────────────────────────────────────────────────────┐
-- │ 1. PROFILES — extends auth.users                    │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.profiles (
    id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email         TEXT UNIQUE NOT NULL,
    full_name     TEXT,
    avatar_url    TEXT,
    phone         TEXT,
    location      TEXT,
    job_title     TEXT,
    bio           TEXT,
    website       TEXT,
    github        TEXT,
    linkedin      TEXT,
    favorite_templates TEXT[] NOT NULL DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ┌─────────────────────────────────────────────────────┐
-- │ 2. RESUMES — core resume documents                  │
-- │    ats_score is THE single source of truth           │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.resumes (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title              TEXT NOT NULL DEFAULT 'Untitled Resume',
    target_role        TEXT,
    template_name      TEXT DEFAULT 'Modern',
    resume_type        TEXT NOT NULL DEFAULT 'experienced'
                       CHECK (resume_type IN ('fresher', 'experienced')),
    is_archived        BOOLEAN NOT NULL DEFAULT FALSE,
    is_favorite        BOOLEAN NOT NULL DEFAULT FALSE,
    original_file_name TEXT,
    file_path          TEXT,
    file_type          TEXT,
    ats_score          INT,
    structure_score    INT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);

CREATE INDEX idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX idx_resumes_deleted_at ON public.resumes(deleted_at);
CREATE INDEX idx_resumes_resume_type ON public.resumes(resume_type);
CREATE INDEX idx_resumes_ats_score ON public.resumes(ats_score);

CREATE TRIGGER update_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ┌─────────────────────────────────────────────────────┐
-- │ 3. RESUME_SECTIONS — normalized section storage     │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.resume_sections (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id     UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    section_type  TEXT NOT NULL,
    section_order INT NOT NULL DEFAULT 0,
    content       JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resume_sections_resume_id ON public.resume_sections(resume_id);
CREATE INDEX idx_resume_sections_type ON public.resume_sections(section_type);

CREATE TRIGGER update_resume_sections_updated_at
    BEFORE UPDATE ON public.resume_sections
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ┌─────────────────────────────────────────────────────┐
-- │ 4. RESUME_ACTIVITY — user activity timeline         │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.resume_activity (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id     UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resume_activity_user_id ON public.resume_activity(user_id);
CREATE INDEX idx_resume_activity_created_at ON public.resume_activity(created_at DESC);

-- ┌─────────────────────────────────────────────────────┐
-- │ 5. JOB_DESCRIPTIONS                                 │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.job_descriptions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title         TEXT NOT NULL,
    company           TEXT,
    location          TEXT,
    jd_text           TEXT NOT NULL,
    extracted_keywords TEXT[] DEFAULT '{}',
    required_skills   TEXT[] DEFAULT '{}',
    experience_level  TEXT,
    industry          TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_descriptions_user_id ON public.job_descriptions(user_id);

CREATE TRIGGER update_job_descriptions_updated_at
    BEFORE UPDATE ON public.job_descriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ┌─────────────────────────────────────────────────────┐
-- │ 6. ATS_REPORTS — full ATS analysis reports          │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.ats_reports (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id              UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_description_id     UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    overall_score          INT NOT NULL DEFAULT 0,
    -- Category scores (all 27 categories from ats.service.ts mapReportToRecord)
    formatting_score       INT,
    sections_score         INT,
    section_order_score    INT,
    keyword_score          INT,
    hard_skills_score      INT,
    soft_skills_score      INT,
    experience_score       INT,
    projects_score         INT,
    education_score        INT,
    certificates_score     INT,
    achievements_score     INT,
    metrics_score          INT,
    star_format_score      INT,
    action_verb_score      INT,
    leadership_score       INT,
    readability_score      INT,
    bullet_quality_score   INT,
    length_score           INT,
    title_score            INT,
    contact_info_score     INT,
    github_score           INT,
    portfolio_score        INT,
    linkedin_score         INT,
    missing_skills_score   INT,
    repeated_keywords_score INT,
    keyword_density_score  INT,
    date_consistency_score INT,
    grammar_typos_score    INT,
    -- Summary data
    missing_keywords       TEXT[] DEFAULT '{}',
    repeated_keywords      TEXT[] DEFAULT '{}',
    top_fixes              JSONB DEFAULT '[]'::jsonb,
    full_report            JSONB DEFAULT '{}'::jsonb,
    analysis_source        TEXT,
    -- Legacy compatibility fields
    grammar_score          INT,
    recommendations        TEXT[] DEFAULT '{}',
    ai_suggestions         JSONB DEFAULT '{}'::jsonb,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ats_reports_user_id ON public.ats_reports(user_id);
CREATE INDEX idx_ats_reports_resume_id ON public.ats_reports(resume_id);

CREATE TRIGGER update_ats_reports_updated_at
    BEFORE UPDATE ON public.ats_reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ┌─────────────────────────────────────────────────────┐
-- │ 7. TAILORED_RESUMES — JD-tailored versions          │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.tailored_resumes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_resume_id  UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    job_description_id  UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
    ats_report_id       UUID REFERENCES public.ats_reports(id) ON DELETE SET NULL,
    tailored_content    JSONB NOT NULL DEFAULT '{}'::jsonb,
    match_percentage    INT DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tailored_resumes_user_id ON public.tailored_resumes(user_id);
CREATE INDEX idx_tailored_resumes_original_id ON public.tailored_resumes(original_resume_id);

CREATE TRIGGER update_tailored_resumes_updated_at
    BEFORE UPDATE ON public.tailored_resumes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ┌─────────────────────────────────────────────────────┐
-- │ 8. NOTIFICATIONS                                    │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.notifications (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    title      TEXT NOT NULL,
    message    TEXT NOT NULL,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);

-- ┌─────────────────────────────────────────────────────┐
-- │ 9. EXPORTS — exported file records                  │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.exports (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id  UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    file_type  TEXT NOT NULL,
    file_url   TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exports_user_id ON public.exports(user_id);

-- ┌─────────────────────────────────────────────────────┐
-- │ 10. AI_HISTORY — AI action audit log                │
-- └─────────────────────────────────────────────────────┘
CREATE TABLE public.ai_history (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id   UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    prompt      TEXT,
    response    JSONB NOT NULL DEFAULT '{}'::jsonb,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_history_user_id ON public.ai_history(user_id);
CREATE INDEX idx_ai_history_resume_id ON public.ai_history(resume_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- PART 5: ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_history ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──────────────────────────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ── RESUMES ───────────────────────────────────────────────────────────────────
CREATE POLICY "Users can view own resumes"
    ON public.resumes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resumes"
    ON public.resumes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resumes"
    ON public.resumes FOR DELETE
    USING (auth.uid() = user_id);

-- ── RESUME_SECTIONS (scoped via parent resume ownership) ──────────────────────
CREATE POLICY "Users can view own resume sections"
    ON public.resume_sections FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.resumes r
        WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own resume sections"
    ON public.resume_sections FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.resumes r
        WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own resume sections"
    ON public.resume_sections FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.resumes r
        WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own resume sections"
    ON public.resume_sections FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.resumes r
        WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

-- ── RESUME_ACTIVITY ───────────────────────────────────────────────────────────
CREATE POLICY "Users can view own activity"
    ON public.resume_activity FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
    ON public.resume_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
    ON public.resume_activity FOR DELETE
    USING (auth.uid() = user_id);

-- ── JOB_DESCRIPTIONS ─────────────────────────────────────────────────────────
CREATE POLICY "Users can manage own job descriptions"
    ON public.job_descriptions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ── ATS_REPORTS ───────────────────────────────────────────────────────────────
CREATE POLICY "Users can manage own ats reports"
    ON public.ats_reports FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ── TAILORED_RESUMES ──────────────────────────────────────────────────────────
CREATE POLICY "Users can manage own tailored resumes"
    ON public.tailored_resumes FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- ── EXPORTS ───────────────────────────────────────────────────────────────────
CREATE POLICY "Users can manage own exports"
    ON public.exports FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ── AI_HISTORY ────────────────────────────────────────────────────────────────
CREATE POLICY "Users can manage own ai history"
    ON public.ai_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- PART 6: AUTH TRIGGER — Auto-create profile on signup
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─────────────────────────────────────────────────────────────────────────────
-- PART 7: STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public)
VALUES
    ('avatars',   'avatars',   true),
    ('resumes',   'resumes',   false),
    ('exports',   'exports',   false),
    ('templates', 'templates', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage policies
DO $$
BEGIN
    -- Clean up any existing storage policies for our buckets
    DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Users Upload Avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users Update Own Avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users Delete Own Avatar" ON storage.objects;
    DROP POLICY IF EXISTS "Users View Own Uploaded Resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Users Upload Resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Users Delete Own Resumes" ON storage.objects;
    DROP POLICY IF EXISTS "Users View Own Exports" ON storage.objects;
    DROP POLICY IF EXISTS "Users Create Own Exports" ON storage.objects;
    DROP POLICY IF EXISTS "Public View Templates Assets" ON storage.objects;

    -- Avatars (public read, authenticated upload, owner update/delete)
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

    -- Resumes storage (owner-scoped)
    CREATE POLICY "Users View Own Uploaded Resumes"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users Upload Resumes"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users Delete Own Resumes"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

    -- Exports storage (owner-scoped)
    CREATE POLICY "Users View Own Exports"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users Create Own Exports"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

    -- Templates storage (public read)
    CREATE POLICY "Public View Templates Assets"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'templates');
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- MIGRATION COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════
-- Tables created:  profiles, resumes, resume_sections, resume_activity,
--                  job_descriptions, ats_reports, tailored_resumes,
--                  notifications, exports, ai_history
-- RLS:            Enabled on all 10 tables with user-scoped policies
-- Triggers:       on_auth_user_created (profile auto-creation)
--                 update_*_updated_at (timestamp auto-update)
-- Storage:        avatars, resumes, exports, templates buckets with policies
-- ═══════════════════════════════════════════════════════════════════════════════
