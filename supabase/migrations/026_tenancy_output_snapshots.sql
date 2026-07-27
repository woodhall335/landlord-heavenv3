-- Immutable, order-bound source of truth for paid tenancy agreement outputs.

CREATE TABLE IF NOT EXISTS public.tenancy_output_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  product_type TEXT NOT NULL,
  jurisdiction TEXT NOT NULL CHECK (
    jurisdiction IN ('england', 'wales', 'scotland', 'northern-ireland')
  ),
  schema_version TEXT NOT NULL,
  source_version TEXT NOT NULL,
  wizard_answers JSONB NOT NULL,
  derived_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  clause_decisions JSONB NOT NULL DEFAULT '{}'::jsonb,
  attachment_states JSONB NOT NULL DEFAULT '{}'::jsonb,
  entitlement_reference TEXT NOT NULL,
  content_sha256 TEXT NOT NULL CHECK (content_sha256 ~ '^[a-f0-9]{64}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tenancy_output_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own tenancy output snapshots"
  ON public.tenancy_output_snapshots;
CREATE POLICY "Users can read own tenancy output snapshots"
  ON public.tenancy_output_snapshots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

REVOKE INSERT, UPDATE, DELETE ON public.tenancy_output_snapshots
  FROM anon, authenticated;
GRANT SELECT ON public.tenancy_output_snapshots TO authenticated;
GRANT ALL ON public.tenancy_output_snapshots TO service_role;

CREATE OR REPLACE FUNCTION public.prevent_tenancy_output_snapshot_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'tenancy output snapshots are immutable';
END;
$$;

DROP TRIGGER IF EXISTS tenancy_output_snapshots_immutable
  ON public.tenancy_output_snapshots;
CREATE TRIGGER tenancy_output_snapshots_immutable
  BEFORE UPDATE OR DELETE ON public.tenancy_output_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.prevent_tenancy_output_snapshot_mutation();

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS tenancy_output_snapshot_id UUID
  REFERENCES public.tenancy_output_snapshots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tenancy_output_snapshots_case
  ON public.tenancy_output_snapshots(case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_tenancy_output_snapshot
  ON public.documents(tenancy_output_snapshot_id)
  WHERE tenancy_output_snapshot_id IS NOT NULL;

DROP INDEX IF EXISTS public.idx_documents_case_type_preview_legacy_unique;
CREATE UNIQUE INDEX idx_documents_case_type_preview_legacy_unique
  ON public.documents (case_id, document_type, is_preview)
  WHERE output_snapshot_id IS NULL AND tenancy_output_snapshot_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_case_type_preview_tenancy_snapshot_unique
  ON public.documents (case_id, document_type, is_preview, tenancy_output_snapshot_id)
  WHERE tenancy_output_snapshot_id IS NOT NULL;
