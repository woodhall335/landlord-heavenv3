-- Add metadata for generic case restart/recovery links.

ALTER TABLE public.case_recovery_tokens
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_case_recovery_tokens_metadata_kind
  ON public.case_recovery_tokens ((metadata->>'kind'));
