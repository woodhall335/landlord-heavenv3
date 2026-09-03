-- Atomic send claims for every recovery email path.
-- Prevents duplicate sends during overlapping cron/manual requests and applies
-- a recipient-wide cooldown across checkout, preview and wizard recovery.

CREATE TABLE IF NOT EXISTS public.recovery_email_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_key TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  recovery_kind TEXT NOT NULL CHECK (recovery_kind IN ('checkout', 'preview', 'wizard')),
  subject_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'sent', 'failed')),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_recovery_email_claims_email_claimed_at
  ON public.recovery_email_claims (email, claimed_at DESC);

ALTER TABLE public.recovery_email_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages recovery email claims"
  ON public.recovery_email_claims;
CREATE POLICY "Service role manages recovery email claims"
  ON public.recovery_email_claims
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.claim_recovery_email(
  p_claim_key TEXT,
  p_email TEXT,
  p_recovery_kind TEXT,
  p_subject_id TEXT,
  p_stage TEXT,
  p_source TEXT,
  p_cooldown_minutes INTEGER DEFAULT 1200
)
RETURNS TABLE (claimed BOOLEAN, reason TEXT, claim_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_email TEXT := LOWER(BTRIM(p_email));
  v_claim_id UUID;
BEGIN
  IF v_email = '' THEN
    RETURN QUERY SELECT FALSE, 'invalid_email'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Serialise recovery decisions for the same recipient.
  PERFORM pg_advisory_xact_lock(hashtextextended(v_email, 0));

  IF EXISTS (
    SELECT 1
    FROM public.email_events
    WHERE event_type = 'recovery_unsubscribed'
      AND LOWER(BTRIM(email)) = v_email
  ) THEN
    RETURN QUERY SELECT FALSE, 'unsubscribed'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  SELECT id INTO v_claim_id
  FROM public.recovery_email_claims
  WHERE claim_key = p_claim_key;

  IF v_claim_id IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'duplicate'::TEXT, v_claim_id;
    RETURN;
  END IF;

  IF GREATEST(COALESCE(p_cooldown_minutes, 0), 0) > 0 AND EXISTS (
    SELECT 1
    FROM public.recovery_email_claims
    WHERE email = v_email
      AND status IN ('claimed', 'sent')
      AND claimed_at > NOW() - make_interval(mins => GREATEST(p_cooldown_minutes, 0))
  ) THEN
    RETURN QUERY SELECT FALSE, 'recipient_cooldown'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  INSERT INTO public.recovery_email_claims (
    claim_key,
    email,
    recovery_kind,
    subject_id,
    stage,
    source
  ) VALUES (
    p_claim_key,
    v_email,
    p_recovery_kind,
    p_subject_id,
    p_stage,
    p_source
  )
  RETURNING id INTO v_claim_id;

  RETURN QUERY SELECT TRUE, 'claimed'::TEXT, v_claim_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_recovery_email(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_recovery_email(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER)
  TO service_role;

REVOKE ALL ON TABLE public.recovery_email_claims FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.recovery_email_claims TO service_role;
