#!/usr/bin/env npx tsx
/**
 * Backfill historical review/preview markers for admin preview-abandoned recovery.
 *
 * Dry-run by default:
 *   npx -p node@20 -p tsx tsx scripts/backfill-preview-abandoned-cases.ts
 *
 * Apply updates:
 *   npx -p node@20 -p tsx tsx scripts/backfill-preview-abandoned-cases.ts --apply
 */

import { config as loadEnv } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

import {
  deriveCaseProductType,
  getHistoricalPreviewBackfillReason,
  isPreviewAbandonedCase,
} from '../src/lib/cases/recovery';

loadEnv({ path: path.resolve(process.cwd(), '.env.local') });
loadEnv();

type RawCase = {
  id: string;
  user_id: string | null;
  case_type: string;
  jurisdiction: string;
  status: string | null;
  workflow_status: string | null;
  wizard_progress: number | null;
  wizard_completed_at: string | null;
  collected_facts: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

type RawOrder = {
  id: string;
  case_id: string;
  product_type: string | null;
  payment_status: string | null;
  paid_at: string | null;
  created_at: string;
};

type RawDocument = {
  case_id: string;
  is_preview: boolean | null;
};

const PAGE_SIZE = 1000;
const CHUNK_SIZE = 200;

function parseArgs() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const json = args.includes('--json');
  const includeAlreadyMarked = args.includes('--include-already-marked');
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const caseTypeArg = args.find((arg) => arg.startsWith('--case-type='));
  const limit = limitArg ? Number.parseInt(limitArg.split('=')[1] || '', 10) : null;
  const caseType = caseTypeArg ? caseTypeArg.split('=')[1] || null : null;

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx -p node@20 -p tsx tsx scripts/backfill-preview-abandoned-cases.ts [options]

Options:
  --apply                  Write updates. Omit for dry-run.
  --limit=N                Stop after N updates/candidates.
  --case-type=TYPE         Restrict to eviction, money_claim, tenancy_agreement, or rent_increase.
  --include-already-marked Include already preview-marked cases in the report.
  --json                   Output JSON summary.

Environment:
  SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
`);
    process.exit(0);
  }

  return {
    apply,
    json,
    includeAlreadyMarked,
    limit: Number.isFinite(limit) && limit! > 0 ? limit : null,
    caseType,
  };
}

function chunk<T>(values: T[], size = CHUNK_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }
  return chunks;
}

function pickBestOrder(current: RawOrder | undefined, candidate: RawOrder): RawOrder {
  if (!current) return candidate;
  if (candidate.payment_status === 'paid' && current.payment_status !== 'paid') return candidate;
  if (current.payment_status === 'paid' && candidate.payment_status !== 'paid') return current;

  const currentTime = new Date(current.paid_at || current.created_at).getTime();
  const candidateTime = new Date(candidate.paid_at || candidate.created_at).getTime();
  return candidateTime > currentTime ? candidate : current;
}

async function fetchCases(supabase: any, caseType: string | null) {
  const rows: RawCase[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    let query = supabase
      .from('cases')
      .select(
        'id, user_id, case_type, jurisdiction, status, workflow_status, wizard_progress, wizard_completed_at, collected_facts, created_at, updated_at'
      )
      .order('updated_at', { ascending: false })
      .range(from, to);

    if (caseType) {
      query = query.eq('case_type', caseType);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch cases: ${error.message}`);

    const pageRows = (data || []) as RawCase[];
    rows.push(...pageRows);
    if (pageRows.length < PAGE_SIZE) return rows;
  }
}

async function fetchOrdersByCase(
  supabase: any,
  caseIds: string[]
): Promise<Map<string, RawOrder>> {
  const byCase = new Map<string, RawOrder>();

  for (const ids of chunk(caseIds)) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, case_id, product_type, payment_status, paid_at, created_at')
      .in('case_id', ids)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    for (const order of (data || []) as RawOrder[]) {
      byCase.set(order.case_id, pickBestOrder(byCase.get(order.case_id), order));
    }
  }

  return byCase;
}

async function fetchDocumentCounts(
  supabase: any,
  caseIds: string[]
): Promise<Map<string, { final: number; preview: number }>> {
  const counts = new Map<string, { final: number; preview: number }>();

  for (const ids of chunk(caseIds)) {
    const { data, error } = await supabase
      .from('documents')
      .select('case_id, is_preview')
      .in('case_id', ids);

    if (error) throw new Error(`Failed to fetch documents: ${error.message}`);

    for (const document of (data || []) as RawDocument[]) {
      const current = counts.get(document.case_id) || { final: 0, preview: 0 };
      if (document.is_preview) {
        current.preview += 1;
      } else {
        current.final += 1;
      }
      counts.set(document.case_id, current);
    }
  }

  return counts;
}

function buildBackfillPatch(caseRow: RawCase, reason: string) {
  const now = new Date().toISOString();
  const inferredReachedAt = caseRow.wizard_completed_at || caseRow.updated_at || caseRow.created_at || now;
  const facts = caseRow.collected_facts || {};
  const meta = facts.__meta && typeof facts.__meta === 'object' ? facts.__meta : {};
  const productType = deriveCaseProductType(caseRow, null);

  return {
    workflow_status: 'preview_ready',
    wizard_progress: Math.max(Number(caseRow.wizard_progress || 0), 100),
    wizard_completed_at: caseRow.wizard_completed_at || inferredReachedAt,
    collected_facts: {
      ...facts,
      __meta: {
        ...meta,
        preview_reached_at: meta.preview_reached_at || inferredReachedAt,
        preview_last_viewed_at: meta.preview_last_viewed_at || inferredReachedAt,
        preview_reached_source: meta.preview_reached_source || 'backfill_preview_abandoned_cases',
        preview_backfilled_at: now,
        preview_backfill_reason: reason,
        ...(productType ? { preview_product: productType } : {}),
      },
    },
  };
}

async function main() {
  const options = parseArgs();
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  });

  const cases = await fetchCases(supabase, options.caseType);
  const caseIds = cases.map((caseRow) => caseRow.id);
  const [ordersByCase, documentCounts] = await Promise.all([
    fetchOrdersByCase(supabase, caseIds),
    fetchDocumentCounts(supabase, caseIds),
  ]);

  const candidates: Array<{
    case_id: string;
    case_type: string;
    jurisdiction: string;
    product_type: string | null;
    updated_at: string;
    reason: string;
    already_marked: boolean;
  }> = [];
  let skippedPaid = 0;
  let skippedFinalDocuments = 0;
  let skippedIncomplete = 0;
  let updated = 0;
  const failures: Array<{ case_id: string; error: string }> = [];

  for (const caseRow of cases) {
    const order = ordersByCase.get(caseRow.id);
    const counts = documentCounts.get(caseRow.id) || { final: 0, preview: 0 };
    const alreadyMarked = isPreviewAbandonedCase({
      caseItem: caseRow,
      order: order || null,
      hasFinalDocuments: counts.final > 0,
      hasPreviewDocuments: counts.preview > 0,
    });

    if (order?.payment_status === 'paid') {
      skippedPaid += 1;
      continue;
    }

    if (counts.final > 0) {
      skippedFinalDocuments += 1;
      continue;
    }

    const reason = getHistoricalPreviewBackfillReason(caseRow);

    if (alreadyMarked && !options.includeAlreadyMarked) {
      continue;
    }

    if (!reason || reason === 'already_preview_marked') {
      skippedIncomplete += 1;
      continue;
    }

    candidates.push({
      case_id: caseRow.id,
      case_type: caseRow.case_type,
      jurisdiction: caseRow.jurisdiction,
      product_type: deriveCaseProductType(caseRow, order || null),
      updated_at: caseRow.updated_at,
      reason,
      already_marked: alreadyMarked,
    });

    if (options.apply) {
      const patch = buildBackfillPatch(caseRow, reason);
      const { error } = await supabase.from('cases').update(patch as any).eq('id', caseRow.id);
      if (error) {
        failures.push({ case_id: caseRow.id, error: error.message });
      } else {
        updated += 1;
      }
    }

    if (options.limit && candidates.length >= options.limit) {
      break;
    }
  }

  const byReason = candidates.reduce<Record<string, number>>((acc, candidate) => {
    acc[candidate.reason] = (acc[candidate.reason] || 0) + 1;
    return acc;
  }, {});
  const byCaseType = candidates.reduce<Record<string, number>>((acc, candidate) => {
    acc[candidate.case_type] = (acc[candidate.case_type] || 0) + 1;
    return acc;
  }, {});
  const summary = {
    mode: options.apply ? 'apply' : 'dry-run',
    scanned: cases.length,
    candidates: candidates.length,
    updated,
    failures,
    skipped: {
      paid: skippedPaid,
      final_documents: skippedFinalDocuments,
      incomplete_or_unmarked: skippedIncomplete,
    },
    by_case_type: byCaseType,
    by_reason: byReason,
    sample: candidates.slice(0, 25),
  };

  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`Preview abandoned backfill ${summary.mode}`);
  console.log(`Scanned: ${summary.scanned}`);
  console.log(`Candidates: ${summary.candidates}`);
  console.log(`Updated: ${summary.updated}`);
  console.log(`Skipped paid: ${summary.skipped.paid}`);
  console.log(`Skipped final docs: ${summary.skipped.final_documents}`);
  console.log(`Skipped incomplete/unmarked: ${summary.skipped.incomplete_or_unmarked}`);
  console.log('By case type:', summary.by_case_type);
  console.log('By reason:', summary.by_reason);
  console.table(summary.sample);

  if (!options.apply) {
    console.log('\nDry-run only. Re-run with --apply to write these preview markers.');
  }

  if (failures.length > 0) {
    console.error('Failures:', failures);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
