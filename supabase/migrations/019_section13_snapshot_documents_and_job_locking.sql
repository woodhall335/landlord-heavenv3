-- =============================================================================
-- LANDLORD HEAVEN - SECTION 13 SNAPSHOT DOCUMENTS AND JOB LOCKING
-- =============================================================================
-- Migration 019: make Section 13 paid documents snapshot-scoped, preserve
-- immutable paid outputs per order, and enforce one active tribunal bundle job
-- per case.
-- =============================================================================

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS output_snapshot_id UUID REFERENCES public.section13_output_snapshots(id) ON DELETE SET NULL;

UPDATE public.documents
SET order_id = NULLIF(metadata->>'order_id', '')::uuid
WHERE order_id IS NULL
  AND metadata ? 'order_id'
  AND (metadata->>'order_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

UPDATE public.documents
SET output_snapshot_id = NULLIF(metadata->>'output_snapshot_id', '')::uuid
WHERE output_snapshot_id IS NULL
  AND metadata ? 'output_snapshot_id'
  AND (metadata->>'output_snapshot_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

DROP INDEX IF EXISTS public.idx_documents_case_type_preview_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_case_type_preview_legacy_unique
  ON public.documents (case_id, document_type, is_preview)
  WHERE output_snapshot_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_case_type_preview_snapshot_unique
  ON public.documents (case_id, document_type, is_preview, output_snapshot_id)
  WHERE output_snapshot_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_order_id
  ON public.documents(order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_output_snapshot_id
  ON public.documents(output_snapshot_id)
  WHERE output_snapshot_id IS NOT NULL;

WITH ranked_active_jobs AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY case_id
      ORDER BY created_at DESC, id DESC
    ) AS active_rank
  FROM public.section13_bundle_jobs
  WHERE status IN ('queued', 'running')
)
UPDATE public.section13_bundle_jobs AS jobs
SET
  status = 'cancelled',
  completed_at = COALESCE(jobs.completed_at, NOW()),
  error_message = COALESCE(
    jobs.error_message,
    'Cancelled automatically during migration to enforce a single active bundle job per case.'
  )
FROM ranked_active_jobs
WHERE jobs.id = ranked_active_jobs.id
  AND ranked_active_jobs.active_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_section13_bundle_jobs_case_active
  ON public.section13_bundle_jobs(case_id)
  WHERE status IN ('queued', 'running');

-- =============================================================================
-- MIGRATION 019 COMPLETE
-- =============================================================================
