-- Repair production schema drift discovered during paid-pack regeneration.
-- Deliberately idempotent: some environments recorded older migrations as
-- applied even though these objects were not present.

CREATE TABLE IF NOT EXISTS public.case_mutation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  changed_keys text[] NOT NULL DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_case_mutation_logs_case_id
  ON public.case_mutation_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_case_mutation_logs_created_at
  ON public.case_mutation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_case_mutation_logs_user_id
  ON public.case_mutation_logs(user_id);

ALTER TABLE public.case_mutation_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'case_mutation_logs'
      AND policyname = 'Users can read own mutation logs'
  ) THEN
    CREATE POLICY "Users can read own mutation logs"
      ON public.case_mutation_logs
      FOR SELECT
      USING (
        user_id = auth.uid()
        OR case_id IN (SELECT id FROM public.cases WHERE user_id = auth.uid())
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'case_mutation_logs'
      AND policyname = 'Service role can insert mutation logs'
  ) THEN
    CREATE POLICY "Service role can insert mutation logs"
      ON public.case_mutation_logs
      FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

GRANT SELECT ON TABLE public.case_mutation_logs TO authenticated;
GRANT ALL ON TABLE public.case_mutation_logs TO service_role;

COMMENT ON TABLE public.case_mutation_logs IS
  'Audit log for mutations to paid cases. Used for security monitoring and fraud detection.';

ALTER TABLE public.marketing_events
  DROP CONSTRAINT IF EXISTS marketing_events_allowed_event;

ALTER TABLE public.marketing_events
  ADD CONSTRAINT marketing_events_allowed_event CHECK (
    event_name IN (
      'site_visit',
      'commercial_bridge_viewed', 'commercial_bridge_clicked',
      'journey_cta_impression', 'journey_cta_click',
      'tool_started', 'tool_completed', 'result_viewed',
      'product_cta_clicked', 'checkout_started', 'purchase_completed',
      'product_page_viewed', 'organic_landing_view',
      'contextual_offer_view', 'contextual_offer_click',
      'product_view', 'product_primary_cta_click',
      'builder_started', 'builder_step_viewed', 'builder_step_completed',
      'builder_validation_error', 'builder_abandoned',
      'preview_requested', 'preview_generated', 'preview_failed',
      'account_creation_started', 'account_created',
      'checkout_opened', 'checkout_failed', 'payment_succeeded',
      'document_delivered', 'cross_sell_viewed', 'cross_sell_clicked'
    )
  );
