-- =============================================================================
-- AI USAGE TABLE (Token tracking and cost monitoring)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- AI operation details
  model TEXT NOT NULL, -- 'gpt-4o-mini', 'claude-sonnet-4-5-20250929', etc.
  operation TEXT NOT NULL, -- 'fact_finding', 'qa_validation', 'document_generation', 'chat'

  -- Token usage
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL,

  -- Related entities
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,

  -- Additional context
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own AI usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage"
  ON public.ai_usage FOR INSERT
  WITH CHECK (true); -- Allow inserts from server-side code

-- Indexes
CREATE INDEX idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage(created_at DESC);
CREATE INDEX idx_ai_usage_operation ON public.ai_usage(operation);
CREATE INDEX idx_ai_usage_model ON public.ai_usage(model);
CREATE INDEX idx_ai_usage_case_id ON public.ai_usage(case_id);
CREATE INDEX idx_ai_usage_document_id ON public.ai_usage(document_id);
