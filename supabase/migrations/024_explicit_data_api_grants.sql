-- =============================================================================
-- LANDLORD HEAVEN - EXPLICIT DATA API GRANTS
-- =============================================================================
-- Supabase public-schema tables are no longer exposed to the Data API by
-- default for new projects, and new tables in existing projects require
-- explicit grants from 30 October 2026.
--
-- RLS policies still decide row-level access. These grants only make each table
-- reachable through PostgREST, GraphQL, and supabase-js for the intended roles.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Service role must be able to manage every app table through server routes,
-- webhooks, cron jobs, admin tools, and document generation.
GRANT ALL PRIVILEGES ON TABLE
  public.users,
  public.cases,
  public.case_facts,
  public.documents,
  public.orders,
  public.webhook_logs,
  public.hmo_properties,
  public.hmo_tenants,
  public.hmo_compliance_items,
  public.ai_usage,
  public.conversations,
  public.councils,
  public.email_subscribers,
  public.email_events,
  public.seo_pages,
  public.seo_keywords,
  public.seo_content_queue,
  public.seo_automation_log,
  public.case_mutation_logs,
  public.orders_duplicate_audit,
  public.cron_runs,
  public.legal_change_audit_log,
  public.legal_change_events,
  public.ask_heaven_questions,
  public.section13_comparables,
  public.section13_comparable_adjustments,
  public.section13_evidence_uploads,
  public.section13_bundle_assets,
  public.case_recovery_tokens,
  public.section13_output_snapshots,
  public.section13_bundle_jobs,
  public.section13_support_requests,
  public.rent_checker_results,
  public.marketing_events
TO service_role;

GRANT SELECT ON TABLE
  public.ai_usage_logs,
  public.councils_with_additional_licensing,
  public.councils_with_selective_licensing,
  public.councils_with_strict_thresholds
TO service_role;

-- Authenticated customer/account tables. RLS still restricts rows to the
-- current user or to cases reachable through the current user's cases.
GRANT SELECT, INSERT, UPDATE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.cases TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.case_facts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.documents TO authenticated;
GRANT SELECT, INSERT ON TABLE public.orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.hmo_properties,
  public.hmo_tenants,
  public.hmo_compliance_items
TO authenticated;
GRANT SELECT ON TABLE public.ai_usage TO authenticated;
GRANT SELECT, INSERT ON TABLE public.conversations TO authenticated;
GRANT SELECT ON TABLE public.case_mutation_logs TO authenticated;

-- Anonymous wizard/session access. RLS policies require the anonymous session
-- token where rows need to be tied back to a browser session.
GRANT SELECT, INSERT, UPDATE ON TABLE public.cases TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.case_facts TO anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.documents TO anon;
GRANT INSERT ON TABLE public.orders TO anon;

-- Public/read-only content and lookup tables.
GRANT SELECT ON TABLE public.councils TO anon, authenticated;
GRANT SELECT ON TABLE
  public.councils_with_additional_licensing,
  public.councils_with_selective_licensing,
  public.councils_with_strict_thresholds
TO anon, authenticated;
GRANT SELECT ON TABLE public.seo_pages TO anon, authenticated;
GRANT SELECT ON TABLE public.ask_heaven_questions TO anon, authenticated;

-- Authenticated/admin-readable operational tables. Management remains
-- service-role only because the policies do not allow direct writes.
GRANT SELECT ON TABLE public.cron_runs TO authenticated;
GRANT SELECT ON TABLE public.legal_change_audit_log TO authenticated;
GRANT SELECT ON TABLE public.legal_change_events TO authenticated;
GRANT SELECT ON TABLE public.ai_usage_logs TO authenticated;

-- Section 13 customer records. RLS limits access through case ownership.
GRANT SELECT, INSERT, UPDATE ON TABLE
  public.section13_comparables,
  public.section13_comparable_adjustments,
  public.section13_evidence_uploads,
  public.section13_bundle_assets
TO authenticated;
GRANT SELECT ON TABLE
  public.section13_output_snapshots,
  public.section13_bundle_jobs,
  public.section13_support_requests
TO authenticated;

-- Existing RPCs exposed through the Data API.
GRANT EXECUTE ON FUNCTION public.section13_create_or_get_bundle_job(
  UUID,
  UUID,
  UUID,
  TEXT,
  TEXT,
  TEXT,
  INTEGER,
  INTEGER,
  INTEGER
) TO service_role;

-- Future migration reminder:
-- New public tables should add explicit GRANT statements in the same migration
-- that creates them. Do not rely on public-schema default API exposure.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO service_role;
