-- =============================================================================
-- SCHEMA CLEANUP - Fix duplicate tables and inconsistencies
-- =============================================================================
-- This migration cleans up issues identified in the schema audit:
-- 1. Drops unused uk_councils table (councils from 002 is the correct one)
-- 2. Adds alias view for ai_usage compatibility
-- 3. Adds missing webhook_logs columns to match usage
-- =============================================================================

-- =============================================================================
-- 1. DROP UNUSED uk_councils TABLE
-- =============================================================================
-- The codebase uses 'councils' table (from 002_councils_table.sql)
-- The 'uk_councils' table from initial schema is unused

DROP TABLE IF EXISTS public.uk_councils CASCADE;

-- Also drop the associated trigger if it exists
DROP TRIGGER IF EXISTS update_councils_updated_at ON public.uk_councils;

-- =============================================================================
-- 2. AI USAGE TABLE COMPATIBILITY
-- =============================================================================
-- The codebase has two AI usage tables:
-- - ai_usage_logs (from 001_initial_schema.sql) - used by admin stats
-- - ai_usage (from 003_ai_usage_table.sql) - used by token tracker
--
-- Create a view so code referencing either table works

-- Create view from ai_usage -> ai_usage_logs format for compatibility
CREATE OR REPLACE VIEW public.ai_usage_logs_view AS
SELECT
  id,
  model,
  operation AS operation_type,
  prompt_tokens AS input_tokens,
  completion_tokens AS output_tokens,
  total_tokens,
  cost_usd AS total_cost_usd,
  user_id,
  case_id,
  document_id,
  created_at
FROM public.ai_usage;

-- Grant access to the view
GRANT SELECT ON public.ai_usage_logs_view TO authenticated;
GRANT SELECT ON public.ai_usage_logs_view TO service_role;

-- =============================================================================
-- 3. ENSURE webhook_logs HAS ALL REQUIRED COLUMNS
-- =============================================================================
-- Add processing_result as JSONB for more flexibility (already added as TEXT in 007)

ALTER TABLE public.webhook_logs
  ALTER COLUMN processing_result TYPE JSONB USING
    CASE
      WHEN processing_result IS NULL THEN NULL
      WHEN processing_result::text = '' THEN NULL
      ELSE to_jsonb(processing_result::text)
    END;

-- =============================================================================
-- 4. ADD MISSING INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for webhook_logs status lookups
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);

-- Index for orders case_id lookups
CREATE INDEX IF NOT EXISTS idx_orders_case_id ON public.orders(case_id);

-- Index for documents jurisdiction lookups
CREATE INDEX IF NOT EXISTS idx_documents_jurisdiction ON public.documents(jurisdiction);

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
