-- Read-only verification for migration 026. Not executed in this continuation.
select table_name
from information_schema.tables
where table_schema = 'public' and table_name = 'tenancy_output_snapshots';

select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'tenancy_output_snapshots'
order by ordinal_position;

select conname, contype, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.tenancy_output_snapshots'::regclass
order by conname;

select indexname, indexdef
from pg_indexes
where schemaname = 'public' and tablename in ('tenancy_output_snapshots', 'documents')
order by tablename, indexname;

select relrowsecurity, relforcerowsecurity
from pg_class
where oid = 'public.tenancy_output_snapshots'::regclass;

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'tenancy_output_snapshots';

select count(*) as orphan_snapshots
from public.tenancy_output_snapshots s
left join public.orders o on o.id = s.order_id
left join public.cases c on c.id = s.case_id
where o.id is null or c.id is null;

select order_id, count(*)
from public.tenancy_output_snapshots
group by order_id
having count(*) > 1;

select count(*) as invalid_hash_rows
from public.tenancy_output_snapshots
where content_sha256 is null or content_sha256 !~ '^[a-f0-9]{64}$';

