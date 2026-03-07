-- =============================================================================
-- LANDLORD HEAVEN - ORDERS & PAYMENTS
-- =============================================================================
-- Migration 002: Orders and webhook logging for Stripe integration
-- =============================================================================

-- =============================================================================
-- 1. ORDERS TABLE (one-time purchases)
-- =============================================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Nullable for anonymous checkout
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,

  -- Product information
  product_type TEXT NOT NULL, -- 'notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement'
  product_name TEXT NOT NULL,

  -- Pricing
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  total_amount DECIMAL(10, 2) NOT NULL,

  -- Payment status
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed', 'refunded', 'partially_refunded'
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_session_id TEXT,
  paid_at TIMESTAMPTZ,

  -- Fulfillment
  fulfillment_status TEXT DEFAULT 'pending', -- 'pending', 'ready_to_generate', 'processing', 'fulfilled', 'failed'
  fulfilled_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Service role full access (for webhooks)
CREATE POLICY "Service role manages orders"
  ON public.orders FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_case_id ON public.orders(case_id);
CREATE INDEX idx_orders_stripe_payment_intent ON public.orders(stripe_payment_intent_id);
CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_session_id);
CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Trigger
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 2. WEBHOOK_LOGS TABLE (Stripe webhook debugging & deduplication)
-- =============================================================================
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Webhook details
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE, -- Unique constraint for deduplication

  -- Payload
  payload JSONB DEFAULT '{}'::jsonb,

  -- Processing status
  status TEXT DEFAULT 'received', -- 'received', 'processing', 'completed', 'failed'
  error_message TEXT,

  -- Processing result (for admin review)
  processing_result JSONB,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Service role only (internal table)
CREATE POLICY "Service role manages webhook_logs"
  ON public.webhook_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_webhook_logs_event_type ON public.webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_stripe_event_id ON public.webhook_logs(stripe_event_id);
CREATE INDEX idx_webhook_logs_status ON public.webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);

-- =============================================================================
-- MIGRATION 002 COMPLETE
-- =============================================================================
