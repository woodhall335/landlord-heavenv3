import fs from 'node:fs/promises';
import path from 'node:path';
import { JSDOM } from 'jsdom';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'src/app');
const PRODUCTS_FILE = path.join(ROOT, 'src/lib/pricing/products.ts');
const OUT_DIR = path.join(ROOT, 'scripts/out');

const BASE_URL = process.env.SEO_AUDIT_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordheaven.co.uk';
const FETCH_TIMEOUT_MS = Number(process.env.SEO_AUDIT_HTML_TIMEOUT_MS || 45000);

const PRODUCT_TYPE = 'Product';
const CONFLICT_TYPES = new Set(['SoftwareApplication', 'AggregateOffer']);

const toPosix = (p) => p.split(path.sep).join('/');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const fp = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(fp));
    else out.push(fp);
  }
  return out;
}

function appRouteFromPage(absPath) {
  const rel = toPosix(path.relative(APP_DIR, absPath));
  const segs = rel.split('/');
  if (segs.at(-1) !== 'page.tsx') return null;
  segs.pop();
  const filtered = segs.filter((seg) => !(seg.startsWith('(') && seg.endsWith(')')));
  const normalized = filtered.map((seg) => seg === 'index' ? '' : seg).filter(Boolean);
  return '/' + normalized.join('/');
}

function dedupe(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function extractProductLandingRoutesFromProductsFile(content) {
  const routeMatches = [...content.matchAll(/productPageHref:\s*SEO_LANDING_ROUTES\.([a-zA-Z0-9_]+)/g)].map((m) => m[1]);
  const landingMap = Object.fromEntries([...content.matchAll(/([a-zA-Z0-9_]+):\s*'([^']+)'/g)].map((m) => [m[1], m[2]]));
  return dedupe(routeMatches.map((key) => landingMap[key]).filter(Boolean));
}

function listProductRelatedRoutes(pageFileRows, productsFileContent) {
  const routesFromProducts = extractProductLandingRoutesFromProductsFile(productsFileContent);

  const routesFromProductsDir = pageFileRows
    .map((row) => row.route)
    .filter((route) => route.startsWith('/products/'));

  const routesFromSchemaUsage = pageFileRows
    .filter((row) => /\b(productSchema|subscriptionProductSchema)\s*\(/.test(row.content) || /"@type"\s*:\s*"Product"/.test(row.content))
    .map((row) => row.route);

  const routesFromPaidSignals = pageFileRows
    .filter((row) => /tenancy-agreements/.test(row.route) || /displayPrice|price|Buy|Start now|wizard\?product/i.test(row.content))
    .map((row) => row.route)
    .filter((route) => route.startsWith('/tenancy-agreements/'));

  return dedupe([
    ...routesFromProducts,
    ...routesFromProductsDir,
    ...routesFromSchemaUsage,
    ...routesFromPaidSignals,
  ]).sort();
}

async function fetchTextWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error(`timeout after ${timeoutMs}ms`)), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    return { res, text: await res.text() };
  } finally {
    clearTimeout(timeout);
  }
}

function parseJsonLdBlocks(doc) {
  const scripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
  return scripts.map((script, idx) => {
    const raw = script.textContent || '';
    try {
      return { index: idx, raw, parsed: JSON.parse(raw), parseError: null };
    } catch (error) {
      return { index: idx, raw, parsed: null, parseError: error instanceof Error ? error.message : String(error) };
    }
  });
}

function collectJsonLdObjects(parsedValue) {
  if (!parsedValue || typeof parsedValue !== 'object') return [];
  if (Array.isArray(parsedValue)) return parsedValue.flatMap((v) => collectJsonLdObjects(v));

  const base = [parsedValue];
  if (Array.isArray(parsedValue['@graph'])) {
    base.push(...parsedValue['@graph'].flatMap((v) => collectJsonLdObjects(v)));
  }
  return base;
}

function normalizeTypes(typeField) {
  if (Array.isArray(typeField)) return typeField.filter(Boolean);
  if (typeof typeField === 'string') return [typeField];
  return [];
}

function isLikelySchemaUrl(value) {
  return typeof value === 'string' && /^https?:\/\/schema\.org\//.test(value);
}

function validateOffer(offer, canonicalUrl, pageUrl) {
  const issues = [];
  const offerTypes = normalizeTypes(offer?.['@type']);
  const offerTypeValid = offerTypes.includes('Offer');
  if (!offerTypeValid) issues.push('offer_missing_or_invalid_@type');

  const price = offer?.price;
  const hasPrice = typeof price === 'number' || (typeof price === 'string' && price.trim().length > 0);
  if (!hasPrice) issues.push('offer_missing_price');

  const priceCurrency = offer?.priceCurrency;
  if (priceCurrency !== 'GBP') issues.push('offer_priceCurrency_not_GBP');

  const availability = offer?.availability;
  if (!isLikelySchemaUrl(availability)) issues.push('offer_availability_not_schema_url');

  const expected = canonicalUrl || pageUrl;
  const offerUrl = offer?.url;
  let offerUrlSamePage = false;
  if (typeof offerUrl === 'string' && offerUrl.length > 0) {
    try {
      offerUrlSamePage = new URL(offerUrl, expected).pathname === new URL(expected).pathname;
    } catch {
      offerUrlSamePage = false;
    }
  }
  if (!offerUrlSamePage) issues.push('offer_url_not_same_page');

  return {
    valid: issues.length === 0,
    issues,
    price: hasPrice ? String(price) : null,
    currency: typeof priceCurrency === 'string' ? priceCurrency : null,
    availability: typeof availability === 'string' ? availability : null,
    offerUrl: typeof offerUrl === 'string' ? offerUrl : null,
    offerType: offerTypes,
  };
}

function validateProductSchema(obj, canonicalUrl, pageUrl) {
  const issues = [];

  const hasName = typeof obj?.name === 'string' && obj.name.trim().length > 0;
  const hasDescription = typeof obj?.description === 'string' && obj.description.trim().length > 0;
  const hasUrl = typeof obj?.url === 'string' && obj.url.trim().length > 0;

  if (!hasName) issues.push('product_missing_name');
  if (!hasDescription) issues.push('product_missing_description');
  if (!hasUrl) issues.push('product_missing_url');

  const offersRaw = obj?.offers;
  const offers = Array.isArray(offersRaw) ? offersRaw : offersRaw ? [offersRaw] : [];
  if (offers.length === 0) {
    issues.push('product_missing_offers');
  }

  const offerResults = offers.map((offer) => validateOffer(offer, canonicalUrl, pageUrl));
  if (offerResults.some((o) => !o.valid)) issues.push('offers_invalid');

  let productUrlSamePage = false;
  if (typeof obj?.url === 'string') {
    try {
      const expected = canonicalUrl || pageUrl;
      productUrlSamePage = new URL(obj.url, expected).pathname === new URL(expected).pathname;
    } catch {
      productUrlSamePage = false;
    }
  }
  if (!productUrlSamePage) issues.push('product_url_not_same_page');

  return {
    valid: issues.length === 0,
    issues,
    offersIsArray: Array.isArray(offersRaw),
    offersCount: offers.length,
    offerResults,
  };
}

function getIndexability(doc, requestUrl, finalUrl, status) {
  const robotsMeta = doc.querySelector('meta[name="robots"]')?.getAttribute('content')?.trim() || '';
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() || null;
  const path = new URL(requestUrl).pathname;

  const noindexMeta = robotsMeta.toLowerCase().includes('noindex');
  let canonicalPointsElsewhere = false;
  if (canonical) {
    try {
      canonicalPointsElsewhere = new URL(canonical, requestUrl).pathname !== path;
    } catch {
      canonicalPointsElsewhere = false;
    }
  }
  const redirectToOther = requestUrl !== finalUrl;
  const httpError = status >= 400 || status === 0;

  const reasons = [
    noindexMeta ? 'noindex_meta' : null,
    canonicalPointsElsewhere ? 'canonical_points_elsewhere' : null,
    redirectToOther ? 'redirect_to_other' : null,
    httpError ? '4xx_5xx_or_fetch_error' : null,
  ].filter(Boolean);

  return {
    indexable: reasons.length === 0,
    reasons,
    canonical,
    robotsMeta,
  };
}

function pickBestProductResult(productResults) {
  if (productResults.length === 0) return null;
  const valid = productResults.find((r) => r.validation.valid);
  if (valid) return valid;
  return productResults[0];
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function run() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const allFiles = await walk(APP_DIR);
  const pageFiles = allFiles.filter((f) => path.basename(f) === 'page.tsx' && !f.includes('/__tests__/'));

  const pageFileRows = await Promise.all(pageFiles.map(async (file) => ({
    file: toPosix(path.relative(ROOT, file)),
    route: appRouteFromPage(file),
    content: await fs.readFile(file, 'utf8'),
  })));

  const productsFileContent = await fs.readFile(PRODUCTS_FILE, 'utf8');
  const productRoutes = listProductRelatedRoutes(pageFileRows, productsFileContent);

  const rows = [];

  for (const route of productRoutes) {
    const requestUrl = new URL(route, BASE_URL).toString();
    let status = 0;
    let finalUrl = requestUrl;
    let html = '';
    let fetchError = null;

    try {
      const { res, text } = await fetchTextWithTimeout(requestUrl, FETCH_TIMEOUT_MS);
      status = res.status;
      finalUrl = res.url;
      html = text;
    } catch (error) {
      fetchError = error instanceof Error ? error.message : String(error);
    }

    const doc = new JSDOM(html).window.document;
    const indexability = getIndexability(doc, requestUrl, finalUrl, status);

    const jsonLdBlocks = parseJsonLdBlocks(doc);
    const jsonLdBlocksDetailed = jsonLdBlocks.map((block) => {
      const objects = block.parsed ? collectJsonLdObjects(block.parsed) : [];
      return {
        index: block.index,
        parseError: block.parseError,
        types: dedupe(objects.flatMap((obj) => normalizeTypes(obj?.['@type']))),
        parsed: block.parsed,
      };
    });

    const jsonLdObjects = jsonLdBlocksDetailed.flatMap((block) =>
      collectJsonLdObjects(block.parsed).map((obj) => ({ blockIndex: block.index, obj }))
    );

    const schemaTypesFound = dedupe(jsonLdBlocksDetailed.flatMap((block) => block.types));

    const productObjects = jsonLdObjects
      .filter(({ obj }) => normalizeTypes(obj?.['@type']).includes(PRODUCT_TYPE))
      .map(({ blockIndex, obj }) => ({
        blockIndex,
        object: obj,
        validation: validateProductSchema(obj, indexability.canonical, requestUrl),
      }));

    const bestProduct = pickBestProductResult(productObjects);

    const conflicts = schemaTypesFound.filter((type) => CONFLICT_TYPES.has(type));
    const issues = [];

    if (jsonLdBlocks.some((b) => b.parseError)) issues.push('jsonld_parse_error');
    if (productObjects.length === 0) issues.push('missing_product_schema');
    if (bestProduct && !bestProduct.validation.valid) issues.push(...bestProduct.validation.issues);
    if (conflicts.length > 0) issues.push(`conflicting_schema:${conflicts.join('|')}`);
    if (!indexability.indexable) issues.push(...indexability.reasons.map((r) => `non_indexable:${r}`));

    const firstOffer = bestProduct?.validation.offerResults[0] || null;

    rows.push({
      route,
      url: requestUrl,
      status,
      finalUrl,
      indexable: indexability.indexable,
      indexabilityReasons: indexability.reasons,
      canonical: indexability.canonical,
      robotsMeta: indexability.robotsMeta,
      fetchError,
      jsonLd: {
        totalBlocks: jsonLdBlocks.length,
        blocks: jsonLdBlocksDetailed,
        parseErrors: jsonLdBlocks.filter((b) => b.parseError).map((b) => ({ index: b.index, error: b.parseError })),
        schemaTypesFound,
      },
      productSchemas: productObjects,
      conflictSchemas: conflicts,
      result: {
        hasProductSchema: productObjects.length > 0,
        productSchemaValid: Boolean(bestProduct?.validation.valid),
        offerValid: Boolean(firstOffer?.valid),
        offersIsArray: bestProduct?.validation.offersIsArray ?? null,
        price: firstOffer?.price ?? null,
        currency: firstOffer?.currency ?? null,
        availability: firstOffer?.availability ?? null,
        issues: dedupe(issues),
      },
    });

    console.log(`[product-snippet-audit] ${route} status=${status} product=${productObjects.length > 0 ? 'Y' : 'N'} valid=${bestProduct?.validation.valid ? 'Y' : 'N'}`);
  }

  const csvHeaders = [
    'url',
    'status',
    'indexable',
    'has_product_schema',
    'product_schema_valid',
    'offer_valid',
    'schema_types_found',
    'price',
    'currency',
    'availability',
    'issues',
  ];

  const csvRows = rows.map((row) => ({
    url: row.url,
    status: row.status,
    indexable: row.indexable,
    has_product_schema: row.result.hasProductSchema,
    product_schema_valid: row.result.productSchemaValid,
    offer_valid: row.result.offerValid,
    schema_types_found: row.jsonLd.schemaTypesFound.join('|'),
    price: row.result.price || '',
    currency: row.result.currency || '',
    availability: row.result.availability || '',
    issues: row.result.issues.join('|'),
  }));

  const csv = [
    csvHeaders.join(','),
    ...csvRows.map((row) => csvHeaders.map((h) => csvEscape(row[h])).join(',')),
  ].join('\n');

  await fs.writeFile(path.join(OUT_DIR, 'product_snippet_audit.csv'), csv);
  await fs.writeFile(path.join(OUT_DIR, 'product_snippet_audit.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routesAudited: productRoutes,
    pages: rows,
  }, null, 2));

  const summary = {
    totalPages: rows.length,
    passed: rows.filter((row) => row.result.hasProductSchema && row.result.productSchemaValid && row.result.offerValid && row.indexable && row.conflictSchemas.length === 0).map((row) => row.route),
    failed: rows
      .filter((row) => !(row.result.hasProductSchema && row.result.productSchemaValid && row.result.offerValid && row.indexable && row.conflictSchemas.length === 0))
      .map((row) => ({ route: row.route, issues: row.result.issues })),
  };

  await fs.writeFile(path.join(OUT_DIR, 'product_snippet_audit_summary.json'), JSON.stringify(summary, null, 2));

  console.log(`Wrote product snippet audit to ${OUT_DIR}`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
