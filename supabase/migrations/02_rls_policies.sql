-- HireFlow AI - Row Level Security Policies (02_rls_policies.sql)

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. RESUMES POLICIES
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

-- 3. RESUME SECTIONS POLICIES
CREATE POLICY "Users can view own resume sections"
    ON public.resume_sections FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own resume sections"
    ON public.resume_sections FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own resume sections"
    ON public.resume_sections FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own resume sections"
    ON public.resume_sections FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

-- 4. JOB DESCRIPTIONS POLICIES
CREATE POLICY "Users can manage own job descriptions"
    ON public.job_descriptions ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. ATS REPORTS POLICIES
CREATE POLICY "Users can manage own ats reports"
    ON public.ats_reports ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. TAILORED RESUMES POLICIES
CREATE POLICY "Users can manage own tailored resumes"
    ON public.tailored_resumes ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. RESUME VERSIONS POLICIES
CREATE POLICY "Users can view own resume versions"
    ON public.resume_versions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own resume versions"
    ON public.resume_versions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own resume versions"
    ON public.resume_versions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.resumes r WHERE r.id = resume_id AND r.user_id = auth.uid()
    ));

-- 8. AI HISTORY POLICIES
CREATE POLICY "Users can manage own ai history"
    ON public.ai_history ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. TEMPLATES POLICIES (Public Read for Active Templates)
CREATE POLICY "Anyone can view active templates"
    ON public.templates FOR SELECT
    USING (is_active = TRUE);

-- 10. NOTIFICATIONS POLICIES
CREATE POLICY "Users can view and update own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 11. EXPORTS POLICIES
CREATE POLICY "Users can manage own exports"
    ON public.exports ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
