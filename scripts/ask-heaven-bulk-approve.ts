#!/usr/bin/env ts-node
// @ts-nocheck

const { createClient } = require('@supabase/supabase-js');
const { validateQualityGates } = require('../src/lib/ask-heaven/questions/quality-gates.ts');

const QUESTIONS_TABLE = 'ask_heaven_questions';

const ALLOWED_TOPICS = new Set([
  'eviction', 'arrears', 'deposit', 'tenancy', 'compliance', 'damage_claim',
  'notice_periods', 'court_process', 'tenant_rights', 'landlord_obligations', 'other',
]);
const ALLOWED_JURISDICTIONS = new Set([
  'england', 'wales', 'scotland', 'northern-ireland', 'uk-wide',
]);

function parseArgs(argv) {
  let dryRun = true;
  let limit;
  let onlyTopic;
  let onlyJurisdiction;

  for (const arg of argv) {
    if (arg === '--dry-run') continue;
    if (arg.startsWith('--dry-run=')) {
      dryRun = arg.split('=')[1]?.trim().toLowerCase() !== 'false';
      continue;
    }
    if (arg.startsWith('--limit=')) {
      const value = Number.parseInt(arg.split('=')[1] ?? '', 10);
      if (!Number.isFinite(value) || value <= 0) throw new Error(`Invalid --limit value: ${arg}`);
      limit = value;
      continue;
    }
    if (arg.startsWith('--only-topic=')) {
      const rawValue = (arg.split('=')[1] ?? '').trim();
      const value = rawValue === 'deposits' ? 'deposit' : rawValue;
      if (!ALLOWED_TOPICS.has(value)) {
        throw new Error(`Invalid --only-topic value: ${value}. Allowed: ${Array.from(ALLOWED_TOPICS).join(', ')}`);
      }
      onlyTopic = value;
      continue;
    }
    if (arg.startsWith('--only-jurisdiction=')) {
      const value = (arg.split('=')[1] ?? '').trim();
      if (!ALLOWED_JURISDICTIONS.has(value)) {
        throw new Error(`Invalid --only-jurisdiction value: ${value}. Allowed: ${Array.from(ALLOWED_JURISDICTIONS).join(', ')}`);
      }
      onlyJurisdiction = value;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { dryRun, limit, onlyTopic, onlyJurisdiction };
}

function evaluateQualityForApproval(question) {
  return validateQualityGates({ ...question, status: 'approved' });
}

async function approveBySlug(client, slug) {
  const { error } = await client
    .from(QUESTIONS_TABLE)
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('slug', slug);

  if (error) throw error;
}

async function loadReviewQuestions(client) {
  const { data, error } = await client
    .from(QUESTIONS_TABLE)
    .select('*')
    .eq('status', 'review')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: {
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    },
    db: { schema: 'public' },
  });
  const reviewQuestions = await loadReviewQuestions(client);

  const skips = [];
  const approvedSlugs = [];
  const approvalFailures = [];
  const gateFailureReasonCounts = new Map();

  const candidates = options.limit ? reviewQuestions.slice(0, options.limit) : reviewQuestions;

  console.log('Ask Heaven bulk approval');
  console.log(`Mode: ${options.dryRun ? 'dry-run' : 'real run'}`);
  console.log(`Review questions loaded: ${reviewQuestions.length}`);
  console.log(`Questions considered: ${candidates.length}`);
  if (options.onlyTopic) console.log(`Filter only-topic: ${options.onlyTopic}`);
  if (options.onlyJurisdiction) console.log(`Filter only-jurisdiction: ${options.onlyJurisdiction}`);
  console.log('');

  for (const question of candidates) {
    if (options.onlyTopic && question.primary_topic !== options.onlyTopic) {
      skips.push({ slug: question.slug, category: 'filtered_topic', details: `topic=${question.primary_topic}` });
      continue;
    }
    if (options.onlyJurisdiction && !question.jurisdictions.includes(options.onlyJurisdiction)) {
      skips.push({ slug: question.slug, category: 'filtered_jurisdiction', details: `jurisdictions=${question.jurisdictions.join(',')}` });
      continue;
    }
    if (question.canonical_slug !== null) {
      skips.push({ slug: question.slug, category: 'has_canonical_slug', details: `canonical_slug=${question.canonical_slug}` });
      continue;
    }

    const qualityResult = evaluateQualityForApproval(question);
    if (!qualityResult.passed) {
      const reasons = qualityResult.failures
        .filter((failure) => failure.severity === 'error')
        .map((failure) => `${failure.gate}: ${failure.reason}`);
      for (const reason of reasons) {
        gateFailureReasonCounts.set(reason, (gateFailureReasonCounts.get(reason) ?? 0) + 1);
      }
      skips.push({ slug: question.slug, category: 'failed_quality_gates', details: reasons.join(' | ') });
      continue;
    }

    if (options.dryRun) {
      approvedSlugs.push(question.slug);
      console.log(`[DRY-RUN] Would approve: ${question.slug}`);
      continue;
    }

    try {
      await approveBySlug(client, question.slug);
      approvedSlugs.push(question.slug);
      console.log(`[APPROVED] ${question.slug}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      approvalFailures.push({ slug: question.slug, error: message });
      console.error(`[FAILED] ${question.slug}: ${message}`);
    }
  }

  const countByCategory = skips.reduce((acc, skip) => {
    acc[skip.category] += 1;
    return acc;
  }, {
    filtered_topic: 0,
    filtered_jurisdiction: 0,
    not_review: 0,
    has_canonical_slug: 0,
    failed_quality_gates: 0,
  });

  const topGateFailures = Array.from(gateFailureReasonCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('\nSummary');
  console.log(`- Approved: ${approvedSlugs.length}`);
  console.log(`- Skipped (duplicate/canonical): ${countByCategory.has_canonical_slug}`);
  console.log(`- Skipped (failed quality gates): ${countByCategory.failed_quality_gates}`);
  console.log(`- Skipped (topic filter): ${countByCategory.filtered_topic}`);
  console.log(`- Skipped (jurisdiction filter): ${countByCategory.filtered_jurisdiction}`);
  console.log(`- Approval failures: ${approvalFailures.length}`);

  if (approvedSlugs.length > 0) {
    console.log('\nApproved slugs');
    for (const slug of approvedSlugs) console.log(`- ${slug}`);
  }

  if (topGateFailures.length > 0) {
    console.log('\nTop failed gate reasons');
    for (const [reason, count] of topGateFailures) console.log(`- (${count}) ${reason}`);
  }

  if (approvalFailures.length > 0) {
    console.log('\nApproval errors');
    for (const failure of approvalFailures) console.log(`- ${failure.slug}: ${failure.error}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Bulk approval failed:');
  console.error(error);
  process.exitCode = 1;
});
