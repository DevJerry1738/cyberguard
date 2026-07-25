-- ============================================================
-- CyberGuard – Add metadata column to assessment_sessions
-- ============================================================

ALTER TABLE public.assessment_sessions
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}';
