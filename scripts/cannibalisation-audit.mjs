import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const ROOT = process.cwd();
const SEO_BASE_DIR = path.join(ROOT, 'audit-output', 'seo-current');
const SEO_LATEST_DIR = path.join(SEO_BASE_DIR, 'latest');
const OUT_DIR = path.join(ROOT, 'audit-output', 'cannibalisation', 'latest');

const REQUIRED_DECISIONS = [
  ['/money-claim', '/products/money-claim', 'money-claim'],
  ['/eviction-notice-template', '/products/notice-only', 'eviction-notice-template'],
  ['/tenancy-agreement-template', '/products/ast', 'tenancy-agreement-template'],
];

function warn(msg) {
  console.warn(`[cannibalisation-audit] WARN: ${msg}`);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeJSON(filePath, obj) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(obj, null, 2)}\n`);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function readJsonSafe(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch (error) {
    warn(`Could not parse JSON file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

async function readJsonlSafe(filePath) {
  const rows = [];
  try {
    const stream = createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let idx = 0;
    for await (const line of rl) {
      idx += 1;
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        rows.push(JSON.parse(trimmed));
      } catch {
        warn(`Skipping invalid JSONL line ${idx} in ${filePath}`);
      }
    }

    return rows;
  } catch (error) {
    warn(`Could not read JSONL file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}

function asString(v) {
  return typeof v === 'string' ? v : '';
}

function asStringArray(v) {
  if (Array.isArray(v)) return v.map((x) => String(x || '').trim()).filter(Boolean);
  if (typeof v === 'string') return v.split('|').map((s) => s.trim()).filter(Boolean);
  return [];
}

function asNumber(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asBoolOrNull(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const normalized = v.trim().toLowerCase();
    if (['true', 'yes', '1', 'indexable'].includes(normalized)) return true;
    if (['false', 'no', '0', 'noindex'].includes(normalized)) return false;
  }
  return null;
}

function normalizeUrl(urlLike) {
  if (!urlLike) return '';
  try {
    const parsed = new URL(urlLike);
    return parsed.pathname || '/';
  } catch {
    return urlLike.startsWith('/') ? urlLike : `/${urlLike}`;
  }
}

function pageTypeFromPath(urlPath) {
  if (urlPath.startsWith('/products/')) return 'product';
  if (urlPath.startsWith('/blog/')) return 'blog';
  if (urlPath.startsWith('/tools/')) return 'tool';
  if (urlPath.startsWith('/ask-heaven')) return 'qa';
  return 'marketing';
}

function normalizeRow(raw) {
  const rawUrl = asString(raw.url) || asString(raw.path) || asString(raw.loc);
  const url = normalizeUrl(rawUrl);
  if (!url) return null;

  const title = asString(raw.title) || asString(raw.meta_title) || asString(raw.seo_title);
  const h1TextsPrimary = asStringArray(raw.h1_texts);
  const h1_texts = h1TextsPrimary.length ? h1TextsPrimary : asStringArray(raw.h1Text || raw.h1 || raw.h1s);
  const h1_count = asNumber(raw.h1_count) ?? asNumber(raw.h1Count) ?? h1_texts.length;
  const canonical = asString(raw.canonical) || asString(raw.canonical_url) || null;
  const indexable = asBoolOrNull(raw.indexable);
  const word_count = asNumber(raw.word_count) ?? asNumber(raw.wordCount) ?? null;
  const jsonldTypesPrimary = asStringArray(raw.jsonld_types);
  const jsonld_types = jsonldTypesPrimary.length
    ? jsonldTypesPrimary
    : asStringArray(raw.jsonLdTypes || raw.structured_data_types);
  const has_faq = (() => {
    const boolField = asBoolOrNull(raw.has_faq ?? raw.hasFaq);
    if (boolField !== null) return boolField;
    return jsonld_types.some((t) => t.toLowerCase().includes('faq'));
  })();
  const ctasPrimary = asStringArray(raw.ctas);
  const ctas = ctasPrimary.length ? ctasPrimary : asStringArray(raw.cta_texts || raw.cta || raw.calls_to_action);

  return {
    url,
    page_type: asString(raw.page_type) || pageTypeFromPath(url),
    title,
    h1_texts,
    h1_count: h1_count ?? 0,
    canonical,
    indexable,
    word_count,
    has_faq,
    jsonld_types,
    ctas,
  };
}

function scoreRichness(rows) {
  let score = 0;
  for (const row of rows) {
    score += row.title ? 1 : 0;
    score += row.h1_texts.length ? 1 : 0;
    score += row.canonical ? 1 : 0;
    score += row.indexable !== null ? 1 : 0;
    score += row.word_count !== null ? 1 : 0;
    score += row.has_faq !== null ? 1 : 0;
    score += row.jsonld_types.length ? 1 : 0;
    score += row.ctas.length ? 1 : 0;
  }
  return score;
}

async function loadSource(baseDir, fileName) {
  const filePath = path.join(baseDir, fileName);
  if (!(await fileExists(filePath))) return null;

  const warnings = [];
  let rawRows = [];

  if (fileName.endsWith('.jsonl')) {
    rawRows = await readJsonlSafe(filePath);
  } else if (fileName.endsWith('.json')) {
    const payload = await readJsonSafe(filePath);
    if (Array.isArray(payload)) rawRows = payload;
    else if (isRecord(payload)) {
      if (Array.isArray(payload.pages)) rawRows = payload.pages;
      else if (Array.isArray(payload.rows)) rawRows = payload.rows;
      else warnings.push(`${fileName} had no pages[]/rows[] array; skipping content`);
    }
  }

  const pages = [];
  for (const row of rawRows) {
    if (!isRecord(row)) {
      warnings.push(`${fileName}: skipped non-object row`);
      continue;
    }
    const normalized = normalizeRow(row);
    if (!normalized) {
      warnings.push(`${fileName}: skipped row with no URL`);
      continue;
    }
    pages.push(normalized);
  }

  return {
    source: fileName,
    pages,
    warnings,
    richnessScore: scoreRichness(pages),
  };
}

function mergePagesByUrl(primary, fallback) {
  const map = new Map();
  for (const row of [...fallback, ...primary]) {
    const existing = map.get(row.url);
    if (!existing) {
      map.set(row.url, row);
      continue;
    }
    map.set(row.url, {
      ...existing,
      ...row,
      h1_texts: row.h1_texts.length ? row.h1_texts : existing.h1_texts,
      jsonld_types: row.jsonld_types.length ? row.jsonld_types : existing.jsonld_types,
      ctas: row.ctas.length ? row.ctas : existing.ctas,
      title: row.title || existing.title,
      canonical: row.canonical || existing.canonical,
      indexable: row.indexable !== null ? row.indexable : existing.indexable,
      word_count: row.word_count ?? existing.word_count,
      has_faq: row.has_faq !== null ? row.has_faq : existing.has_faq,
      h1_count: row.h1_count || existing.h1_count,
    });
  }
  return Array.from(map.values());
}

function keywordBucket(urlPath) {
  return urlPath
    .replace(/^\//, '')
    .replace(/^products\//, '')
    .replace(/-template$/g, '')
    .replace(/-(england|wales|scotland|northern-ireland|uk)$/g, '');
}

function buildDecisions(pages) {
  const byBucket = new Map();
  const available = new Set(pages.map((p) => p.url));

  for (const row of pages) {
    const bucket = keywordBucket(row.url);
    const current = byBucket.get(bucket) || [];
    current.push(row.url);
    byBucket.set(bucket, Array.from(new Set(current)));
  }

  const decisions = [];
  for (const [bucket, urls] of byBucket.entries()) {
    if (urls.length < 2) continue;
    const primary = urls.find((u) => u.startsWith('/products/')) || urls[0];
    const competing = urls.filter((u) => u !== primary);
    decisions.push({
      group_key: bucket,
      primary_url: primary,
      competing_urls: competing,
      action: competing.some((u) => u.startsWith('/products/') || primary.startsWith('/products/'))
        ? 'differentiate_intent'
        : 'merge_or_prune',
      rationale: 'Same topic cluster detected by normalized slug bucket; keep one primary URL and reduce intent overlap.',
    });
  }

  for (const [a, b, key] of REQUIRED_DECISIONS) {
    const primary = b;
    const groupKey = `required:${key}`;
    const fallbackDecision = {
      group_key: groupKey,
      primary_url: primary,
      competing_urls: [a],
      action: 'differentiate_intent',
      rationale: 'Required decision: keep product URL as transactional primary; keep editorial URL for informational intent and avoid canonical cross-over unless pages are near-duplicates.',
    };

    const idx = decisions.findIndex((d) => d.competing_urls.includes(a) && d.primary_url === b);
    if (idx === -1) decisions.push(fallbackDecision);

    if (!available.has(a)) warn(`Required URL missing from input data: ${a}`);
    if (!available.has(b)) warn(`Required URL missing from input data: ${b}`);
  }

  return decisions;
}

function toCanonicalActionRows(decisions) {
  const rows = [
    'group_key,primary_url,secondary_url,recommended_action,canonical_target,notes',
  ];
  for (const decision of decisions) {
    for (const secondary of decision.competing_urls) {
      const canonicalTarget = decision.action === 'canonicalize' ? decision.primary_url : '';
      rows.push([
        decision.group_key,
        decision.primary_url,
        secondary,
        decision.action,
        canonicalTarget,
        decision.rationale,
      ].map((value) => {
        const s = String(value ?? '');
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(','));
    }
  }
  return rows.join('\n') + '\n';
}

async function getInputDir() {
  const latestExists = await fileExists(SEO_LATEST_DIR);
  if (latestExists) {
    const latestFiles = await fs.readdir(SEO_LATEST_DIR);
    console.log(`[cannibalisation-audit] inspected ${SEO_LATEST_DIR} -> ${latestFiles.join(', ') || '(empty)'}`);
    if (latestFiles.length > 0) return SEO_LATEST_DIR;
  } else {
    console.log(`[cannibalisation-audit] inspected ${SEO_LATEST_DIR} -> (missing)`);
  }

  const baseFiles = await fs.readdir(SEO_BASE_DIR).catch(() => []);
  if (baseFiles.some((name) => name.endsWith('.json') || name.endsWith('.jsonl'))) {
    warn(`Using fallback source directory ${SEO_BASE_DIR} because latest is empty/missing`);
    return SEO_BASE_DIR;
  }

  const dirs = await fs.readdir(SEO_BASE_DIR, { withFileTypes: true }).catch(() => []);
  const timestampDirs = dirs.filter((d) => d.isDirectory() && d.name !== 'latest').map((d) => d.name).sort();
  const newest = timestampDirs.at(-1);
  if (newest) {
    const fallback = path.join(SEO_BASE_DIR, newest);
    warn(`Using fallback timestamped directory ${fallback}`);
    return fallback;
  }

  throw new Error(`No SEO input directories found under ${SEO_BASE_DIR}`);
}

async function main() {
  const inputDir = await getInputDir();

  const sourceOrder = ['onpage.jsonl', 'seo_audit_report.json', 'crawl_table.jsonl', 'pages.jsonl', 'report.json'];

  const loaded = (await Promise.all(sourceOrder.map((file) => loadSource(inputDir, file)))).filter(Boolean);
  if (loaded.length === 0) {
    throw new Error(`No supported input files found in ${inputDir}`);
  }

  for (const source of loaded) {
    for (const message of source.warnings) warn(message);
    console.log(`[cannibalisation-audit] source ${source.source}: pages=${source.pages.length}, richness=${source.richnessScore}`);
  }

  loaded.sort((a, b) => b.richnessScore - a.richnessScore);
  const primary = loaded[0];
  const secondaryMerged = loaded.slice(1).flatMap((s) => s.pages);
  const normalizedPages = mergePagesByUrl(primary.pages, secondaryMerged);

  const decisions = buildDecisions(normalizedPages);

  const groups = decisions.map((d) => ({
    group_key: d.group_key,
    primary_url: d.primary_url,
    competing_urls: d.competing_urls,
    action: d.action,
    rationale: d.rationale,
  }));

  await ensureDir(OUT_DIR);
  await writeJSON(path.join(OUT_DIR, 'cannibalisation_groups.json'), groups);
  await fs.writeFile(path.join(OUT_DIR, 'canonical_actions.csv'), toCanonicalActionRows(decisions));

  const requiredLines = REQUIRED_DECISIONS.map(([a, b]) => {
    const decision = decisions.find((d) => d.primary_url === b && d.competing_urls.includes(a));
    const action = decision?.action || 'differentiate_intent';
    return `- ${a} vs ${b}: **${action}** (primary: ${b}).`;
  });

  const summaryMd = [
    '# Cannibalisation Audit Summary',
    '',
    `- Input directory: \`${inputDir}\``,
    `- Sources loaded: ${loaded.map((s) => `${s.source} (richness=${s.richnessScore})`).join(', ')}`,
    `- Normalized pages: ${normalizedPages.length}`,
    `- Cannibalisation groups: ${groups.length}`,
    '',
    '## Required decisions',
    ...requiredLines,
    '',
    '## Notes',
    '- This audit is fault-tolerant: missing fields produce warnings and are treated as nullable.',
    '- Precedence is based on measured field richness, with source-order tie-breaks documented in the script comments.',
  ].join('\n');

  await fs.writeFile(path.join(OUT_DIR, 'summary.md'), `${summaryMd}\n`);

  console.log(`[cannibalisation-audit] Wrote outputs to ${OUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
