-- Adds the explicit Fresher / Experienced resume-type field.
-- This is a first-class, user-chosen field (never calculated from years of
-- experience) so it gets a real column — filterable/indexable from the
-- Dashboard — rather than being buried only inside resume_sections JSONB.
--
-- Section order, custom sections, and styling preferences are still stored
-- in a 'meta' resume_sections row (section_type is free-form TEXT with no
-- CHECK constraint, so no migration was needed for those).

ALTER TABLE public.resumes
  ADD COLUMN IF NOT EXISTS resume_type TEXT NOT NULL DEFAULT 'experienced'
  CHECK (resume_type IN ('fresher', 'experienced'));

CREATE INDEX IF NOT EXISTS idx_resumes_resume_type ON public.resumes(resume_type);
