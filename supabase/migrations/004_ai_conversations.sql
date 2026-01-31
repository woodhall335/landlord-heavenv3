-- =============================================================================
-- LANDLORD HEAVEN - AI & CONVERSATIONS
-- =============================================================================
-- Migration 004: AI usage tracking and Ask Heaven conversations
-- =============================================================================

-- =============================================================================
-- 1. AI_USAGE TABLE (consolidated token tracking)
-- =============================================================================
-- Note: This consolidates the previously separate ai_usage and ai_usage_logs tables
CREATE TABLE public.ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- AI model information
  model TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'fact_finding', 'qa_validation', 'document_generation', 'ask_heaven', 'decision_engine'

  -- Token usage
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,

  -- Cost tracking
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,

  -- Associated records
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,

  -- Additional context
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI usage
CREATE POLICY "Users can view own AI usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Service role for inserts (server-side tracking)
CREATE POLICY "Service role manages ai_usage"
  ON public.ai_usage FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_ai_usage_user_id ON public.ai_usage(user_id);
CREATE INDEX idx_ai_usage_case_id ON public.ai_usage(case_id);
CREATE INDEX idx_ai_usage_document_id ON public.ai_usage(document_id);
CREATE INDEX idx_ai_usage_model ON public.ai_usage(model);
CREATE INDEX idx_ai_usage_operation ON public.ai_usage(operation);
CREATE INDEX idx_ai_usage_created_at ON public.ai_usage(created_at DESC);

-- =============================================================================
-- 2. AI_USAGE_LOGS VIEW (for backwards compatibility with admin stats)
-- =============================================================================
CREATE VIEW public.ai_usage_logs AS
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
GRANT SELECT ON public.ai_usage_logs TO authenticated;
GRANT SELECT ON public.ai_usage_logs TO service_role;

-- =============================================================================
-- 3. CONVERSATIONS TABLE (Ask Heaven chat history)
-- =============================================================================
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,

  -- Message details
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,

  -- AI model info
  model TEXT,
  tokens_used INTEGER,

  -- Question context (for wizard integration)
  question_id TEXT,
  input_type TEXT, -- 'text', 'select', 'date', 'boolean'
  user_input JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Access through case ownership
CREATE POLICY "Users can view conversations through case"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = conversations.case_id
      AND (c.user_id = auth.uid() OR (c.user_id IS NULL AND c.session_token = current_setting('request.headers.x-session-token', true)))
    )
  );

CREATE POLICY "Users can insert conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cases c
      WHERE c.id = conversations.case_id
      AND (c.user_id = auth.uid() OR c.user_id IS NULL)
    )
  );

-- Service role full access
CREATE POLICY "Service role manages conversations"
  ON public.conversations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_conversations_case_id ON public.conversations(case_id);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at);
CREATE INDEX idx_conversations_question_id ON public.conversations(question_id);

-- =============================================================================
-- MIGRATION 004 COMPLETE
-- =============================================================================
