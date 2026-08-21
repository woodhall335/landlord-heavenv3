ALTER TABLE public.tenancy_output_snapshots
  ADD COLUMN IF NOT EXISTS revision_number INTEGER NOT NULL DEFAULT 1;

ALTER TABLE public.tenancy_output_snapshots
  DROP CONSTRAINT IF EXISTS tenancy_output_snapshots_order_id_key;

DROP INDEX IF EXISTS public.tenancy_output_snapshots_order_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenancy_output_snapshots_order_revision_unique
  ON public.tenancy_output_snapshots(order_id, revision_number);

CREATE INDEX IF NOT EXISTS idx_tenancy_output_snapshots_order_revision_desc
  ON public.tenancy_output_snapshots(order_id, revision_number DESC);
