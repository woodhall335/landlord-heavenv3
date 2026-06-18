import { readFile } from 'node:fs/promises';
import path from 'node:path';
import JSZip from 'jszip';

const DEFAULT_INDEX_ENTRY = '00_READ_FIRST_CASE_SUMMARY_AND_INDEX/02-bundle-index.docx';
const DEFAULT_EXCLUDED_TOP_LEVEL_ITEMS = new Set(['__MACOSX']);

function normalizePath(value) {
  return value.replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+$/, '').trim();
}

function decodeXmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function readDocxText(docxBuffer) {
  const docx = await JSZip.loadAsync(docxBuffer);
  const documentXml = await docx.file('word/document.xml')?.async('string');

  if (!documentXml) {
    throw new Error('The bundle index docx is missing word/document.xml');
  }

  return decodeXmlEntities(
    documentXml
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim(),
  );
}

function extractBundleIndexItems(indexText) {
  const items = new Set();

  for (const rawLine of indexText.split(/\r?\n/)) {
    const line = rawLine.trim();
    const match = line.match(/^((?:\d{2}_[A-Z0-9_]+|audit-[a-z0-9-]+)(?:[\\/][^:]+)?):/i);
    if (match?.[1]) {
      items.add(normalizePath(match[1]));
      continue;
    }

    const standaloneMatch = line.match(/^((?:\d{2}_[A-Z0-9_]+|audit-[a-z0-9-]+)(?:[\\/]\S+)?)$/i);
    if (standaloneMatch?.[1]) {
      items.add(normalizePath(standaloneMatch[1]));
    }
  }

  return [...items];
}

function reconcileBundleIndexWithZipManifest(indexedItems, zipEntries) {
  const actualEntries = new Set();
  const actualTopLevelItems = new Set();

  for (const entry of zipEntries) {
    const normalized = normalizePath(entry);
    if (!normalized) continue;
    actualEntries.add(normalized);
    const [topLevel] = normalized.split('/');
    if (topLevel) actualTopLevelItems.add(topLevel);
  }

  const indexed = [...new Set(indexedItems.map(normalizePath).filter(Boolean))];
  const indexedTopLevelItems = new Set(indexed.map((item) => item.split('/')[0]).filter(Boolean));
  const rows = indexed.map((indexedItem) => {
    const existsInZip =
      actualEntries.has(indexedItem) ||
      actualTopLevelItems.has(indexedItem) ||
      [...actualEntries].some((entry) => entry.startsWith(`${indexedItem}/`));

    return {
      indexedItem,
      existsInZip,
      status: existsInZip ? 'PASS' : 'FAIL',
    };
  });

  const missingIndexedItems = rows.filter((row) => !row.existsInZip).map((row) => row.indexedItem);
  const unindexedTopLevelItems = [...actualTopLevelItems]
    .filter((item) => !DEFAULT_EXCLUDED_TOP_LEVEL_ITEMS.has(item))
    .filter((item) => !indexedTopLevelItems.has(item))
    .sort();

  return {
    ok: missingIndexedItems.length === 0 && unindexedTopLevelItems.length === 0,
    rows,
    missingIndexedItems,
    unindexedTopLevelItems,
  };
}

async function main() {
  const [, , zipPathArg, indexEntryArg] = process.argv;
  if (!zipPathArg) {
    throw new Error(
      `Usage: node scripts/validate-bundle-index-manifest.mjs <customer-zip-path> [index-entry]\nDefault index entry: ${DEFAULT_INDEX_ENTRY}`,
    );
  }

  const zipPath = path.resolve(zipPathArg);
  const indexEntry = indexEntryArg ?? DEFAULT_INDEX_ENTRY;
  const zipBuffer = await readFile(zipPath);
  const zip = await JSZip.loadAsync(zipBuffer);
  const zipEntries = Object.keys(zip.files).filter((entry) => !zip.files[entry]?.dir);
  const normalizedIndexEntry = normalizePath(indexEntry);
  const matchingIndexEntry = zipEntries.find((entry) => normalizePath(entry) === normalizedIndexEntry);
  const indexFile = matchingIndexEntry ? zip.file(matchingIndexEntry) : null;

  if (!indexFile) {
    throw new Error(`Bundle index not found in zip: ${indexEntry}`);
  }

  const indexText = await readDocxText(await indexFile.async('nodebuffer'));
  const reconciliation = reconcileBundleIndexWithZipManifest(
    extractBundleIndexItems(indexText),
    zipEntries,
  );

  console.log('Bundle Index vs Actual Zip Manifest');
  for (const row of reconciliation.rows) {
    console.log(`${row.status}\t${row.indexedItem}\t${row.existsInZip ? 'exists' : 'missing'}`);
  }

  if (reconciliation.missingIndexedItems.length > 0) {
    console.error(`Missing indexed items: ${reconciliation.missingIndexedItems.join(', ')}`);
  }

  if (reconciliation.unindexedTopLevelItems.length > 0) {
    console.error(`Unindexed top-level items: ${reconciliation.unindexedTopLevelItems.join(', ')}`);
  }

  if (!reconciliation.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
