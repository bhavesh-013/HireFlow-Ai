-- HireFlow AI - Explicit ATS Score Columns (08_ats_score.sql)

ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS ats_score INT;
ALTER TABLE public.resumes ADD COLUMN IF NOT EXISTS structure_score INT;

CREATE INDEX IF NOT EXISTS idx_resumes_ats_score ON public.resumes(ats_score);
