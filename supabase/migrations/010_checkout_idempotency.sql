-- =============================================================================
-- LANDLORD HEAVEN - CHECKOUT IDEMPOTENCY
-- =============================================================================
-- Migration 010: Add idempotency protection for checkout
--
-- Purpose:
--   Prevent double-payment for the same (case_id, product_type) by:
--   1. Adding stripe_checkout_url column to store the checkout URL for reuse
--   2. Adding a partial unique index on (case_id, product_type) for paid orders
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
-- 2. ADD PARTIAL UNIQUE INDEX FOR PAID ORDERS
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
-- 3. ADD INDEX FOR CHECKOUT IDEMPOTENCY QUERIES
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
