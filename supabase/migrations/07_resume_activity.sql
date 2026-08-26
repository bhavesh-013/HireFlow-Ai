-- HireFlow AI - Resume Activity & File Metadata Migration (07_resume_activity.sql)

-- Add optional file metadata columns to resumes table
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS original_file_name TEXT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Resume Activity / History table
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

-- Enable RLS
ALTER TABLE public.resume_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own activity"
    ON public.resume_activity FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
    ON public.resume_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activity"
    ON public.resume_activity FOR DELETE
    USING (auth.uid() = user_id);
