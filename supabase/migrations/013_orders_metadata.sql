-- =============================================================================
-- LANDLORD HEAVEN - ORDERS METADATA COLUMN
-- =============================================================================
-- Migration 013: Add metadata column to orders table for storing fulfillment
-- state, Section 21 validation blockers, and required actions.
--
-- This migration is backward-compatible and uses IF NOT EXISTS to handle
-- cases where the column may have been added manually.
-- =============================================================================

-- Add metadata column as JSONB with default empty object
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb NOT NULL;

-- Add comment explaining the column usage
COMMENT ON COLUMN public.orders.metadata IS 'Stores fulfillment metadata including: required_actions, section21_blockers, blocked_documents, validation state, error messages, and resume attempts.';

-- Create index for common metadata queries (e.g., finding orders that require action)
CREATE INDEX IF NOT EXISTS idx_orders_metadata_requires_action
ON public.orders ((metadata->>'validation'))
WHERE metadata->>'validation' = 'requires_action';

-- =============================================================================
-- MIGRATION 013 COMPLETE
-- =============================================================================
