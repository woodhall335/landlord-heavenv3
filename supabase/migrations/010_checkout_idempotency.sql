-- =============================================================================
-- LANDLORD HEAVEN - CHECKOUT IDEMPOTENCY
-- =============================================================================
-- Migration 010: Add idempotency protection for checkout
--
-- Purpose:
--   Prevent double-payment for the same (case_id, product_type) by:
--   1. Adding stripe_checkout_url column to store the checkout URL for reuse
--   2. Cleaning up existing duplicate paid orders (keeping the most recent)
--   3. Adding a partial unique index on (case_id, product_type) for paid orders
--
-- This ensures:
--   - Only ONE paid order can exist per (case_id, product_type) combination
--   - Pending checkout sessions can be reused instead of creating duplicates
-- =============================================================================

-- =============================================================================
-- 1. ADD stripe_checkout_url COLUMN
-- =============================================================================
-- Stores the Stripe checkout URL for reusing pending sessions

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT;

COMMENT ON COLUMN public.orders.stripe_checkout_url IS
  'Stripe checkout session URL for reusing pending sessions';

-- =============================================================================
-- 2. CLEAN UP EXISTING DUPLICATE PAID ORDERS
-- =============================================================================
-- Before adding the unique constraint, we need to resolve existing duplicates.
-- Strategy: Keep the MOST RECENT paid order, mark older duplicates as 'duplicate_resolved'
--
-- This preserves data for audit purposes while allowing the constraint to be created.

-- First, create a backup table of the duplicates for audit purposes
CREATE TABLE IF NOT EXISTS public.orders_duplicate_audit (
  id UUID PRIMARY KEY,
  original_order_id UUID,
  case_id UUID,
  product_type TEXT,
  user_id UUID,
  payment_status TEXT,
  original_payment_status TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ DEFAULT NOW(),
  resolution_reason TEXT DEFAULT 'migration_010_duplicate_cleanup'
);

-- Insert duplicate orders into audit table (all but the most recent per case_id/product_type)
INSERT INTO public.orders_duplicate_audit (
  id, original_order_id, case_id, product_type, user_id,
  payment_status, original_payment_status, paid_at, created_at
)
SELECT
  o.id,
  (SELECT id FROM public.orders o2
   WHERE o2.case_id = o.case_id
   AND o2.product_type = o.product_type
   AND o2.payment_status = 'paid'
   ORDER BY o2.paid_at DESC NULLS LAST, o2.created_at DESC
   LIMIT 1) as original_order_id,
  o.case_id,
  o.product_type,
  o.user_id,
  'duplicate_resolved',
  o.payment_status,
  o.paid_at,
  o.created_at
FROM public.orders o
WHERE o.payment_status = 'paid'
  AND o.case_id IS NOT NULL
  AND o.id != (
    -- Keep the most recent paid order for each (case_id, product_type)
    SELECT id FROM public.orders o2
    WHERE o2.case_id = o.case_id
    AND o2.product_type = o.product_type
    AND o2.payment_status = 'paid'
    ORDER BY o2.paid_at DESC NULLS LAST, o2.created_at DESC
    LIMIT 1
  )
ON CONFLICT (id) DO NOTHING;

-- Update the duplicate orders to mark them as resolved
-- This allows the unique constraint to be created
UPDATE public.orders
SET payment_status = 'duplicate_resolved'
WHERE id IN (SELECT id FROM public.orders_duplicate_audit);

-- Log how many duplicates were resolved
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count FROM public.orders_duplicate_audit;
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Resolved % duplicate paid orders. See orders_duplicate_audit table for details.', duplicate_count;
  END IF;
END $$;

-- =============================================================================
-- 3. ADD PARTIAL UNIQUE INDEX FOR PAID ORDERS
-- =============================================================================
-- This prevents multiple paid orders for the same (case_id, product_type)
-- Uses a partial index to only enforce uniqueness for paid orders
-- Allows multiple pending/failed orders to exist (which is fine)

-- Drop the index if it exists (idempotent migration)
DROP INDEX IF EXISTS idx_orders_unique_paid_case_product;

-- Create partial unique index
-- Only enforces uniqueness where:
--   - case_id is NOT NULL (orders without case_id are not constrained)
--   - payment_status = 'paid'
CREATE UNIQUE INDEX idx_orders_unique_paid_case_product
ON public.orders (case_id, product_type)
WHERE case_id IS NOT NULL AND payment_status = 'paid';

COMMENT ON INDEX idx_orders_unique_paid_case_product IS
  'Ensures only one paid order exists per (case_id, product_type) combination';

-- =============================================================================
-- 4. ADD INDEX FOR CHECKOUT IDEMPOTENCY QUERIES
-- =============================================================================
-- Optimize the query that checks for existing orders during checkout

DROP INDEX IF EXISTS idx_orders_case_product_status;

CREATE INDEX idx_orders_case_product_status
ON public.orders (case_id, product_type, payment_status)
WHERE case_id IS NOT NULL;

COMMENT ON INDEX idx_orders_case_product_status IS
  'Optimizes checkout idempotency queries for existing orders';

-- =============================================================================
-- MIGRATION 010 COMPLETE
-- =============================================================================
