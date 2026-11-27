BEGIN;

-- Aggregate creation counts survive deletion of anonymous customer drafts.
-- No names, addresses, case IDs, contact details or answers are retained here.
CREATE TABLE IF NOT EXISTS public.wizard_start_daily_counts (
  day date NOT NULL,
  case_type text NOT NULL,
  product_type text NOT NULL,
  starts bigint NOT NULL DEFAULT 0 CHECK (starts >= 0),
  PRIMARY KEY (day, case_type, product_type)
);
CREATE TABLE IF NOT EXISTS public.wizard_start_tracking_state (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  started_at timestamptz NOT NULL DEFAULT now(),
  seeded_at timestamptz
);
ALTER TABLE public.wizard_start_daily_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wizard_start_tracking_state ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.wizard_start_daily_counts, public.wizard_start_tracking_state FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.wizard_start_daily_counts, public.wizard_start_tracking_state TO service_role;

INSERT INTO public.wizard_start_tracking_state (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.record_wizard_case_start()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE product text;
BEGIN
  IF NEW.case_type NOT IN ('eviction', 'money_claim', 'tenancy_agreement', 'rent_increase') THEN RETURN NEW; END IF;
  product := coalesce(NEW.collected_facts #>> '{__meta,product}', NEW.collected_facts ->> 'product', 'unknown');
  -- Do not store arbitrary user input in the aggregate dimensions.
  IF product NOT IN ('notice_only', 'complete_pack', 'money_claim', 'ast_standard', 'ast_premium',
    'tenancy_agreement', 'section13_standard', 'section13_defensive',
    'england_standard_tenancy_agreement', 'england_premium_tenancy_agreement',
    'england_student_tenancy_agreement', 'england_hmo_shared_house_tenancy_agreement', 'england_lodger_agreement') THEN
    product := 'unknown';
  END IF;
  INSERT INTO public.wizard_start_daily_counts (day, case_type, product_type, starts)
  VALUES ((NEW.created_at AT TIME ZONE 'Europe/London')::date, NEW.case_type, product, 1)
  ON CONFLICT (day, case_type, product_type)
  DO UPDATE SET starts = wizard_start_daily_counts.starts + 1;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.record_wizard_case_start() FROM PUBLIC;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'record_wizard_case_start' AND tgrelid = 'public.cases'::regclass) THEN
    CREATE TRIGGER record_wizard_case_start AFTER INSERT ON public.cases
    FOR EACH ROW EXECUTE FUNCTION public.record_wizard_case_start();
  END IF;
END;
$$;

-- Seed once. Deleted historical drafts cannot be reconstructed; the UI reports
-- the coverage boundary instead of claiming that these are complete totals.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.wizard_start_tracking_state WHERE id AND seeded_at IS NULL) THEN
    INSERT INTO public.wizard_start_daily_counts (day, case_type, product_type, starts)
    SELECT (created_at AT TIME ZONE 'Europe/London')::date, case_type,
      CASE WHEN coalesce(collected_facts #>> '{__meta,product}', collected_facts ->> 'product') IN
        ('notice_only', 'complete_pack', 'money_claim', 'ast_standard', 'ast_premium', 'tenancy_agreement',
         'section13_standard', 'section13_defensive', 'england_standard_tenancy_agreement',
         'england_premium_tenancy_agreement', 'england_student_tenancy_agreement',
         'england_hmo_shared_house_tenancy_agreement', 'england_lodger_agreement')
      THEN coalesce(collected_facts #>> '{__meta,product}', collected_facts ->> 'product') ELSE 'unknown' END,
      count(*)
    FROM public.cases
    WHERE case_type IN ('eviction', 'money_claim', 'tenancy_agreement', 'rent_increase')
    GROUP BY 1, 2, 3
    ON CONFLICT (day, case_type, product_type) DO UPDATE
      SET starts = greatest(wizard_start_daily_counts.starts, EXCLUDED.starts);
    UPDATE public.wizard_start_tracking_state SET seeded_at = now() WHERE id;
  END IF;
END;
$$;
COMMIT;
