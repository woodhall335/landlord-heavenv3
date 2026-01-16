-- =============================================================================
-- MIGRATION 011: Add unique constraint on documents (case_id, document_type, is_preview)
-- =============================================================================
-- This migration adds a unique constraint to ensure that each document type
-- can only exist once per case and preview status. This enables proper upsert
-- behavior using document_type as the canonical key instead of document_title.
-- =============================================================================

-- Add unique constraint for exact document type matching in fulfillment
-- This replaces the previous title-based approach with key-based matching
CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_case_type_preview_unique
  ON public.documents (case_id, document_type, is_preview);

-- Add comment explaining the constraint
COMMENT ON INDEX idx_documents_case_type_preview_unique IS
  'Ensures each document_type can only exist once per case and preview status. Used by fulfillment upsert logic.';

-- =============================================================================
-- MIGRATION 011 COMPLETE
-- =============================================================================
