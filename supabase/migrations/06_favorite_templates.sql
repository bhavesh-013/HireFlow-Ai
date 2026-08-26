-- Adds template-favoriting support for the Resume Templates page.
-- Favorites are a small per-user list of template ids, so they live as a
-- plain array column on the existing profiles table rather than a new
-- table — no new database, per the project's existing Supabase-only rule.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS favorite_templates TEXT[] NOT NULL DEFAULT '{}';
