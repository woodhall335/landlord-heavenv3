-- =============================================================================
-- LANDLORD HEAVEN - SECTION 13 ATOMIC BUNDLE JOB CREATE/REUSE
-- =============================================================================
-- Migration 020: add a transactional helper that atomically reuses existing
-- jobs by idempotency key, reuses active jobs, and only inserts when safe.
-- =============================================================================

DROP FUNCTION IF EXISTS public.section13_create_or_get_bundle_job(
  UUID,
  UUID,
  UUID,
  TEXT,
  TEXT,
  TEXT,
  INTEGER,
  INTEGER,
  INTEGER
);

CREATE OR REPLACE FUNCTION public.section13_create_or_get_bundle_job(
  p_case_id UUID,
  p_order_id UUID,
  p_output_snapshot_id UUID,
  p_idempotency_key TEXT,
  p_status TEXT DEFAULT 'queued',
  p_generation_mode TEXT DEFAULT 'sync',
  p_attempt_count INTEGER DEFAULT 0,
  p_max_attempts INTEGER DEFAULT 3,
  p_warning_count INTEGER DEFAULT 0
)
RETURNS public.section13_bundle_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.section13_bundle_jobs%ROWTYPE;
BEGIN
  SELECT *
  INTO v_job
  FROM public.section13_bundle_jobs
  WHERE case_id = p_case_id
    AND idempotency_key = p_idempotency_key
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN v_job;
  END IF;

  SELECT *
  INTO v_job
  FROM public.section13_bundle_jobs
  WHERE case_id = p_case_id
    AND status IN ('queued', 'running')
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  IF FOUND THEN
    RETURN v_job;
  END IF;

  INSERT INTO public.section13_bundle_jobs (
    case_id,
    order_id,
    output_snapshot_id,
    idempotency_key,
    status,
    generation_mode,
    attempt_count,
    max_attempts,
    warning_count
  )
  VALUES (
    p_case_id,
    p_order_id,
    p_output_snapshot_id,
    p_idempotency_key,
    p_status,
    p_generation_mode,
    p_attempt_count,
    p_max_attempts,
    p_warning_count
  )
  RETURNING * INTO v_job;

  RETURN v_job;
EXCEPTION
  WHEN unique_violation THEN
    SELECT *
    INTO v_job
    FROM public.section13_bundle_jobs
    WHERE case_id = p_case_id
      AND idempotency_key = p_idempotency_key
    ORDER BY created_at DESC, id DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN v_job;
    END IF;

    SELECT *
    INTO v_job
    FROM public.section13_bundle_jobs
    WHERE case_id = p_case_id
      AND status IN ('queued', 'running')
    ORDER BY created_at DESC, id DESC
    LIMIT 1;

    IF FOUND THEN
      RETURN v_job;
    END IF;

    RAISE;
END;
$$;

REVOKE ALL ON FUNCTION public.section13_create_or_get_bundle_job(
  UUID,
  UUID,
  UUID,
  TEXT,
  TEXT,
  TEXT,
  INTEGER,
  INTEGER,
  INTEGER
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.section13_create_or_get_bundle_job(
  UUID,
  UUID,
  UUID,
  TEXT,
  TEXT,
  TEXT,
  INTEGER,
  INTEGER,
  INTEGER
) TO service_role;

-- =============================================================================
-- MIGRATION 020 COMPLETE
-- =============================================================================
